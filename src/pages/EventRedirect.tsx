import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import NotFound from './NotFound';

const EventRedirect = () => {
  const { id } = useParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('events')
        .select('slug')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data?.slug) {
        setNotFound(true);
      } else {
        setSlug(data.slug);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-[#1A1A1A] text-2xl">Carregando...</div>
      </div>
    );
  }
  if (notFound || !slug) return <NotFound />;
  return <Navigate to={`/evento/${slug}`} replace />;
};

export default EventRedirect;
