-- Add policy to allow anyone to count event registrations
-- This is safe because the table only contains UUIDs and timestamps, no PII
CREATE POLICY "Anyone can count event registrations"
  ON public.event_registrations
  FOR SELECT
  USING (true);