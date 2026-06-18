
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker=off) AS
SELECT
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  tags
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
