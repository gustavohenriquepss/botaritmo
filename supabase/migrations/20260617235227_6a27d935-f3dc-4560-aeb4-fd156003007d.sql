DROP POLICY IF EXISTS "Users can update their own events" ON public.events;

CREATE POLICY "Authenticated users can update their own events"
ON public.events
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);