import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPriceBRL } from '@/lib/price';
import { BrazilCupBadge } from '@/components/BrazilCupBadge';
import { Share2, Pencil } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { MobileDatePicker } from '@/components/MobileDatePicker';

interface Profile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  tags: string[];
}

interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  target_date: string;
  price_cents: number | null;
  broadcasts_brazil_game: boolean;
}

const EventCard = ({ event }: { event: Event }) => {
  const navigate = useNavigate();
  return (
    <div className="relative cursor-pointer group" onClick={() => navigate(`/evento/${event.slug}`)}>
      <div className="overflow-hidden mb-3">
        <div
          className="aspect-square bg-gray-300 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${event.background_image_url})` }}
        />
      </div>
      <div className="absolute top-4 left-4 flex flex-col gap-0">
        <div className="bg-white border border-black px-3 h-[23px] flex items-center">
          <div className="text-[11px] font-medium uppercase leading-none">{event.date}</div>
        </div>
        <div className="bg-white border border-t-0 border-black px-3 h-[23px] flex items-center">
          <div className="text-[11px] font-medium leading-none">{event.time}</div>
        </div>
        <div
          className={`border border-t-0 border-black px-3 h-[23px] flex items-center ${
            event.price_cents == null || event.price_cents === 0
              ? 'bg-black text-white'
              : 'bg-white text-black'
          }`}
        >
          <div className="text-[11px] font-medium uppercase leading-none">{formatPriceBRL(event.price_cents)}</div>
        </div>
      </div>
      {event.broadcasts_brazil_game && (
        <div className="absolute top-4 right-4">
          <BrazilCupBadge />
        </div>
      )}
      <h3 className="text-lg font-medium font-display">{event.title}</h3>
      <p className="text-sm text-gray-500 mt-1">{event.address}</p>
    </div>
  );
};

const PublicProfile = () => {
  const { handle } = useParams<{ handle: string }>();
  const username = handle?.startsWith('@') ? handle.slice(1) : handle;
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const cleanUsername = (username ?? '').toLowerCase();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, bio, avatar_url, tags')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (!profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(profileData);

      const { data: eventsData } = await supabase
        .from('events')
        .select('id, slug, title, date, time, address, background_image_url, target_date, price_cents, broadcasts_brazil_game')
        .eq('created_by', profileData.user_id)
        .order('target_date', { ascending: true });

      setEvents(eventsData ?? []);
      setLoading(false);
    };
    load();
  }, [username]);

  const now = Date.now();
  const upcoming = useMemo(
    () => events.filter((e) => new Date(e.target_date).getTime() >= now - 60 * 60 * 1000),
    [events, now]
  );
  const past = useMemo(
    () =>
      events
        .filter((e) => new Date(e.target_date).getTime() < now - 60 * 60 * 1000)
        .sort((a, b) => new Date(b.target_date).getTime() - new Date(a.target_date).getTime()),
    [events, now]
  );

  const eventDates = useMemo(
    () => upcoming.map((e) => new Date(e.target_date)),
    [upcoming]
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: profile?.display_name ?? 'Perfil', url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success('Link copiado');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 text-center text-[11px] uppercase">Carregando...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl font-display font-medium mb-4">PERFIL NÃO ENCONTRADO</h1>
          <p className="text-sm text-gray-500 mb-6">O username @{username} não existe.</p>
          <Link
            to="/"
            className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-black group"
          >
            <span className="relative z-10">VOLTAR PARA DESCOBRIR</span>
            <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title={`${profile.display_name ?? profile.username} (@${profile.username})`}
        description={profile.bio ?? `Eventos de ${profile.display_name ?? profile.username}`}
      />
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-32 pb-16">
        {/* Header */}
        <section className="flex flex-col md:flex-row gap-6 md:gap-8 border-b border-black pb-8 mb-12">
          <div className="w-32 h-32 md:w-40 md:h-40 border border-black bg-gray-100 overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name ?? ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] uppercase text-gray-400">
                Sem foto
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-medium">{profile.display_name ?? profile.username}</h1>
            <p className="text-sm text-gray-500 mt-1">@{profile.username}</p>
            {profile.bio && <p className="text-sm mt-3 max-w-prose whitespace-pre-line">{profile.bio}</p>}
            {profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {profile.tags.map((t) => (
                  <span key={t} className="inline-flex items-center bg-white border border-black text-[11px] uppercase px-2 py-1">
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {currentUserId === profile.user_id && (
                <Link
                  to="/perfil/editar"
                  className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center gap-2 text-[11px] font-medium uppercase border border-black group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Pencil className="w-3 h-3" />
                    EDITAR PERFIL
                  </span>
                  <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                </Link>
              )}
              <button
                onClick={handleShare}
                className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center gap-2 text-[11px] font-medium uppercase border border-black group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Share2 className="w-3 h-3" />
                  COMPARTILHAR
                </span>
                <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
              </button>
            </div>
          </div>
        </section>

        {/* Calendar */}
        {upcoming.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[11px] uppercase font-medium mb-4">CALENDÁRIO</h2>
            <div className="border border-black inline-block">
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                locale={ptBR}
                modifiers={{ hasEvent: eventDates }}
                modifiersClassNames={{ hasEvent: 'bg-brand text-black font-bold' }}
                onSelect={(d) => {
                  if (!d) return;
                  const ev = upcoming.find(
                    (e) =>
                      new Date(e.target_date).toDateString() === d.toDateString()
                  );
                  if (ev) navigate(`/evento/${ev.slug}`);
                }}
                className="p-3 pointer-events-auto"
              />
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section className="mb-12">
          <h2 className="text-[11px] uppercase font-medium mb-4">PRÓXIMOS EVENTOS</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum evento futuro.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-[11px] uppercase font-medium mb-4">EVENTOS PASSADOS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
              {past.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PublicProfile;
