
-- Remove broad public SELECT exposing all profile columns including user_id
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Public-facing view exposing only presentation fields (no user_id, no timestamps)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=off) AS
SELECT
  id,
  username,
  display_name,
  avatar_url,
  bio,
  tags
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
