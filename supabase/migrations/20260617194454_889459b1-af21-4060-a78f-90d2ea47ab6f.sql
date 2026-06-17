CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION public.generate_event_slug(_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public, extensions
AS $$
  SELECT trim(both '-' from regexp_replace(
    regexp_replace(lower(unaccent(coalesce(_title, ''))), '[^a-z0-9]+', '-', 'g'),
    '-+', '-', 'g'
  ));
$$;

CREATE OR REPLACE FUNCTION public.set_event_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  i int := 2;
BEGIN
  -- Only generate when slug is missing; keep slugs stable across title edits.
  IF NEW.slug IS NOT NULL AND length(NEW.slug) > 0 THEN
    RETURN NEW;
  END IF;

  base := public.generate_event_slug(NEW.title);
  IF base IS NULL OR base = '' THEN
    base := 'evento';
  END IF;

  candidate := base;
  WHILE EXISTS (
    SELECT 1 FROM public.events
    WHERE slug = candidate AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) LOOP
    candidate := base || '-' || i;
    i := i + 1;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_set_slug ON public.events;
CREATE TRIGGER events_set_slug
BEFORE INSERT OR UPDATE OF title, slug ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_event_slug();

-- Backfill existing rows (one at a time so the trigger handles uniqueness)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM public.events WHERE slug IS NULL OR slug = '' LOOP
    UPDATE public.events SET slug = NULL WHERE id = r.id;
    UPDATE public.events SET title = title WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.events ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_key ON public.events(slug);