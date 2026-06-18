DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload own profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;

CREATE POLICY "Authenticated users can upload own profile avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
  AND name LIKE ('avatars/' || auth.uid()::text || '/%')
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'])
);

CREATE POLICY "Authenticated users can update own profile avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
  AND name LIKE ('avatars/' || auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
  AND name LIKE ('avatars/' || auth.uid()::text || '/%')
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'])
);

CREATE POLICY "Authenticated users can delete own profile avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
  AND name LIKE ('avatars/' || auth.uid()::text || '/%')
);

CREATE POLICY "Public can view event images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'event-images');