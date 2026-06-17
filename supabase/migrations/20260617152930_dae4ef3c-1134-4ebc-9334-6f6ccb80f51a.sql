
-- 1. Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from public/anon.
-- has_role is only called inside RLS policies (runs as definer regardless of caller EXECUTE),
-- so safe to revoke from anon and authenticated callers.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- get_event_registration_count must remain callable by authenticated users via RPC.
REVOKE EXECUTE ON FUNCTION public.get_event_registration_count(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_event_registration_count(uuid) TO authenticated, service_role;

-- 3. Prevent public listing of the event-images bucket while keeping individual file
-- access via public URLs working. Drop any broad SELECT policy on storage.objects
-- that allows listing the bucket.
DROP POLICY IF EXISTS "Public read access for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can list event-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
