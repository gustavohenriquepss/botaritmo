REVOKE EXECUTE ON FUNCTION public.update_own_event(uuid, text, text, text, text, text, text, timestamptz, text, text, integer, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_own_event(uuid, text, text, text, text, text, text, timestamptz, text, text, integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_own_event(uuid, text, text, text, text, text, text, timestamptz, text, text, integer, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_event(uuid, text, text, text, text, text, text, timestamptz, text, text, integer, boolean) TO service_role;