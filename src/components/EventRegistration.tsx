import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface EventRegistrationProps {
  eventId: string;
  onRegister: () => void;
  isRegistered: boolean;
  className?: string;
  onAuthRequired?: () => void;
  targetDate?: Date;
}

export const EventRegistration: React.FC<EventRegistrationProps> = ({ 
  eventId,
  onRegister, 
  isRegistered: initialIsRegistered,
  className = "",
  onAuthRequired,
  targetDate
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [loading, setLoading] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const { toast } = useToast();

  const fetchRegistrationCount = async () => {
    const { data } = await supabase
      .rpc('get_event_registration_count', { _event_id: eventId });

    setRegistrationCount(Number(data ?? 0));
  };

  useEffect(() => {
    fetchRegistrationCount();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRegistration(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRegistration(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [eventId]);

  const checkRegistration = async (userId: string) => {
    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();
    
    setIsRegistered(!!data);
  };

  const getEventStatus = () => {
    if (!targetDate) return 'upcoming';
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const distance = target - now;
    const oneHour = 1000 * 60 * 60;
    
    if (distance < -oneHour) return 'ended';
    if (distance >= -oneHour && distance <= oneHour) return 'happening';
    return 'upcoming';
  };

  const eventStatus = getEventStatus();
  const isPastEvent = eventStatus === 'ended';

  const handleRegister = async () => {
    if (isPastEvent) {
      toast({
        title: 'Evento encerrado',
        description: 'Você não pode se inscrever em eventos passados',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast({
          title: 'É necessário entrar',
          description: 'Por favor, entre para se inscrever em eventos',
          variant: 'destructive'
        });
      }
      return;
    }

    setLoading(true);
    
    try {
      if (isRegistered) {
        // Unregister
        const { error } = await supabase
          .from('event_registrations')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;

        setIsRegistered(false);
        setRegistrationCount(prev => Math.max(0, prev - 1));
        toast({
          title: 'Inscrição cancelada',
          description: 'Você cancelou sua inscrição neste evento'
        });
      } else {
        // Register
        const { error } = await supabase
          .from('event_registrations')
          .insert({
            user_id: user.id,
            event_id: eventId
          });

        if (error) throw error;

        setIsRegistered(true);
        setRegistrationCount(prev => prev + 1);
        onRegister();
        toast({
          title: 'Inscrito!',
          description: 'Você se inscreveu com sucesso neste evento'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="group flex items-center self-stretch relative overflow-hidden">
        <button 
          onClick={handleRegister}
          disabled={loading || isPastEvent}
          className={`flex h-[50px] justify-center items-center gap-2.5 border relative px-2.5 py-3.5 border-solid transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-[calc(100%-50px)] z-10 ${
            isPastEvent 
              ? 'bg-gray-400 border-gray-400 cursor-not-allowed' 
              : 'bg-[#1A1A1A] border-[#1A1A1A] group-hover:w-full group-hover:bg-brand group-hover:border-brand'
          }`}
          aria-label={isPastEvent ? "Evento encerrado" : isRegistered ? "Cancelar inscrição" : "Inscrever-se"}
        >
          <span className={`text-white text-[13px] font-normal uppercase relative transition-colors duration-300 ${!isPastEvent && 'group-hover:text-black'}`}>
            {loading ? "CARREGANDO..." : isPastEvent ? "EVENTO ENCERRADO" : isRegistered ? "CANCELAR INSCRIÇÃO" : "EU VOU"}
          </span>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-[18px] opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100"
            aria-hidden="true"
          >
            <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
            <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
          </svg>
        </button>
        {!isPastEvent && (
          <div className="flex w-[50px] h-[50px] justify-center items-center border absolute right-0 bg-white rounded-[99px] border-solid border-[#1A1A1A] transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-50 pointer-events-none z-0">
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="arrow-icon"
            aria-hidden="true"
          >
            <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
            <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
          </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export const RegistrationCounter: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [registrationCount, setRegistrationCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      
      setRegistrationCount(count ?? 0);
    };
    
    fetchCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`registrations-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`
        },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (registrationCount === 0) return null;

  return (
    <div className="flex justify-center items-center gap-[5px] bg-white px-4 py-2.5 max-sm:px-3 max-sm:py-2 animate-fade-in">
      <div className="text-[#1A1A1A] text-[42px] font-medium tracking-[-1.68px] max-md:text-[32px] max-md:tracking-[-1.28px] max-sm:text-2xl max-sm:tracking-[-0.96px]">
        {registrationCount} {registrationCount === 1 ? 'CONFIRMADO' : 'CONFIRMADOS'}
      </div>
    </div>
  );
};
