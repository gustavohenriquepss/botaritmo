DROP POLICY IF EXISTS "Users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete event images" ON storage.objects;

CREATE POLICY "Users can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'])
);

CREATE POLICY "Users can update event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'event-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'])
);

CREATE POLICY "Users can delete event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);