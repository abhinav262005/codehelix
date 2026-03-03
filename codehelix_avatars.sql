-- Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Note: Ensure you have a public bucket named 'avatars' in Supabase Storage.
-- The following policies assume the bucket 'avatars' exists:

-- 1. Allow public to read avatar images
-- (This should be done in the Supabase Dashboard for the 'avatars' bucket)

-- 2. Allow users to upload their own avatar
-- (Replace 'avatars' with your bucket name if different)
-- Policy for INSERT/UPDATE/DELETE on storage.objects:
-- (u.id::text = (storage.foldername(name))[1])
