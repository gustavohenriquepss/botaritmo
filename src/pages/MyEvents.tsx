import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BrazilCupBadge } from '@/components/BrazilCupBadge';
interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  broadcasts_brazil_game: boolean;
}

const EventCard = ({ 
  event, 
  isCreated, 
  onDelete 
}: { 
  event: Event; 
  isCreated?: boolean; 
  onDelete?: (id: string) => void;
}) => {
  const navigate = useNavigate();
  
  const handleDelete = () => {
    onDelete?.(event.id);
  };
  
  return (
    <div 
      className="relative cursor-pointer group"
      onClick={() => navigate(isCreated ? `/event/${event.id}/edit` : `/evento/${event.slug}`)}
    >
      <div className="overflow-hidden mb-3">
        <div 
          className="aspect-[4/3] bg-gray-300 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${event.background_image_url})` }}
        ></div>
      </div>
      <div className="absolute top-4 left-4 flex flex-col gap-0">
        <div className="bg-white border border-black px-3 h-[23px] flex items-center">
          <div className="text-[11px] font-medium uppercase leading-none">{event.date}</div>
        </div>
        <div className="bg-white border border-t-0 border-black px-3 h-[23px] flex items-center">
          <div className="text-[11px] font-medium leading-none">{event.time}</div>
        </div>
      </div>
      {isCreated && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 right-4 bg-white border border-black p-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Excluir evento"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border border-black rounded-none p-0 gap-0 max-w-md">
            <AlertDialogHeader className="p-6 pb-4">
              <AlertDialogTitle className="text-lg font-medium">Excluir evento</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-black/60">
                Tem certeza que deseja excluir "{event.title}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-0 p-0 border-t border-black">
              <AlertDialogCancel className="flex-1 h-12 rounded-none border-0 border-r border-black bg-white text-black text-[11px] font-medium uppercase hover:bg-gray-100 m-0">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="flex-1 h-12 rounded-none border-0 bg-black text-white text-[11px] font-medium uppercase hover:bg-black/80 m-0"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <h3 className="text-base font-medium font-display">{event.title}</h3>
    </div>
  );
};

const MyEvents = () => {
  const [user, setUser] = useState<User | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'registered'>('created');
  const [slideStyle, setSlideStyle] = useState({ width: 0, transform: 'translateX(0)' });
  const createdRef = useRef<HTMLButtonElement>(null);
  const registeredRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/');
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  useEffect(() => {
    const updateSlidePosition = () => {
      if (activeTab === 'created' && createdRef.current) {
        setSlideStyle({
          width: createdRef.current.offsetWidth,
          transform: 'translateX(0)'
        });
      } else if (activeTab === 'registered' && registeredRef.current && createdRef.current) {
        setSlideStyle({
          width: registeredRef.current.offsetWidth,
          transform: `translateX(${createdRef.current.offsetWidth}px)`
        });
      }
    };

    updateSlidePosition();
    window.addEventListener('resize', updateSlidePosition);
    return () => window.removeEventListener('resize', updateSlidePosition);
  }, [activeTab, createdEvents.length, registeredEvents.length]);

  const fetchMyEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch created events
      const { data: created, error: createdError } = await supabase
        .from('events')
        .select('id, slug, title, date, time, background_image_url')
        .eq('created_by', user.id)
        .order('target_date', { ascending: true });

      if (createdError) throw createdError;
      setCreatedEvents(created || []);

      // Fetch registered events
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          event_id,
          events (
            id,
            slug,
            title,
            date,
            time,
            background_image_url
          )
        `)
        .eq('user_id', user.id);

      if (regError) throw regError;
      
      const registeredEventsData = registrations
        ?.map(r => r.events)
        .filter(Boolean) as Event[] || [];
      
      setRegisteredEvents(registeredEventsData);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Evento excluído com sucesso');
      fetchMyEvents();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting event:', error);
      toast.error('Falha ao excluir evento');
    }
  };

  const displayedEvents = activeTab === 'created' ? createdEvents : registeredEvents;

  return (
    <>
      <SEOHead 
        title="Meus Eventos"
        description="Gerencie seus eventos criados e veja os eventos em que você se inscreveu"
      />
      <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,slnt,wdth,wght,GRAD,ROND@6..144,-10..0,25..151,1..1000,0..100,0..100&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-white">
        <Navbar />
        
        <div className="pt-32 pb-20 px-4 md:px-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-8 font-display">
              Meus Eventos
            </h1>

            {/* Tabs */}
            <div className="relative flex gap-0 mb-12">
              {/* Sliding background */}
              <div 
                className="absolute top-0 left-0 h-full bg-brand border border-black transition-all duration-300 ease-out pointer-events-none"
                style={{
                  width: `${slideStyle.width}px`,
                  transform: slideStyle.transform
                }}
              />
              
              <button
                ref={createdRef}
                onClick={() => setActiveTab('created')}
                className="relative z-10 px-6 py-3 text-[11px] font-medium uppercase text-black border border-black transition-colors max-sm:flex-1 bg-transparent"
              >
                Criados por mim ({createdEvents.length})
              </button>
              <button
                ref={registeredRef}
                onClick={() => setActiveTab('registered')}
                className="relative z-10 px-6 py-3 text-[11px] font-medium uppercase text-black border border-l-0 border-black transition-colors max-sm:flex-1 bg-transparent"
              >
                Inscrições ({registeredEvents.length})
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-12">Carregando eventos...</div>
              ) : displayedEvents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  {activeTab === 'created' 
                    ? 'Você ainda não criou nenhum evento' 
                    : 'Você ainda não se inscreveu em nenhum evento'}
                </div>
              ) : (
                displayedEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    isCreated={activeTab === 'created'}
                    onDelete={activeTab === 'created' ? handleDeleteEvent : undefined}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyEvents;
