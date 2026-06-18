CREATE OR REPLACE FUNCTION public.update_own_event(
  _event_id uuid,
  _title text,
  _description text,
  _date text,
  _time text,
  _address text,
  _background_image_url text,
  _target_date timestamptz,
  _creator text,
  _venue text,
  _price_cents integer,
  _broadcasts_brazil_game boolean
)
RETURNS public.events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _updated_event public.events;
  _current_user uuid := auth.uid();
BEGIN
  IF _current_user IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado' USING ERRCODE = '28000';
  END IF;

  UPDATE public.events
  SET
    title = trim(_title),
    description = trim(_description),
    date = trim(_date),
    time = trim(_time),
    address = trim(_address),
    background_image_url = _background_image_url,
    target_date = _target_date,
    creator = trim(_creator),
    venue = nullif(trim(coalesce(_venue, '')), ''),
    price_cents = _price_cents,
    broadcasts_brazil_game = coalesce(_broadcasts_brazil_game, false)
  WHERE id = _event_id
    AND (
      created_by = _current_user
      OR public.has_role(_current_user, 'admin'::public.app_role)
    )
  RETURNING * INTO _updated_event;

  IF _updated_event.id IS NULL THEN
    RAISE EXCEPTION 'Evento não encontrado ou sem permissão para editar' USING ERRCODE = '42501';
  END IF;

  RETURN _updated_event;
END;
$$;

REVOKE ALL ON FUNCTION public.update_own_event(uuid, text, text, text, text, text, text, timestamptz, text, text, integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_own_event(uuid, text, text, text, text, text, text, timestamptz, text, text, integer, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_event(uuid, text, text, text, text, text, text, timestamptz, text, text, integer, boolean) TO service_role;