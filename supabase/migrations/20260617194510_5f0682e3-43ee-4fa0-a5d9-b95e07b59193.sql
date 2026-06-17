-- Give slug a default so Insert type treats it as optional; trigger still fills meaningful value
ALTER TABLE public.events ALTER COLUMN slug SET DEFAULT '';

-- Move unaccent extension out of public schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION unaccent SET SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.generate_event_slug(_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public, extensions
AS $$
  SELECT trim(both '-' from regexp_replace(
    regexp_replace(lower(extensions.unaccent(coalesce(_title, ''))), '[^a-z0-9]+', '-', 'g'),
    '-+', '-', 'g'
  ));
$$;