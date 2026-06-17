REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public;

REVOKE EXECUTE ON FUNCTION public.get_event_registration_count(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_event_registration_count(uuid) TO authenticated, service_role;