-- Phase 7: Storage RLS for license-verification bucket
-- Run these in the Supabase SQL Editor (Dashboard > SQL Editor).
-- The bucket must already exist and have RLS enabled.

-- Users can upload their own documents (INSERT)
CREATE POLICY "Users can upload own license"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'license-verification'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own documents (SELECT)
CREATE POLICY "Users can read own license"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'license-verification'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can read all documents (SELECT)
CREATE POLICY "Admins can read all licenses"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'license-verification'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
