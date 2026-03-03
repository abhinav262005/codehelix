-- 1. Add avatar_url column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- 3. Set up Storage Policies
-- Note: These policies allow anyone to view avatars, but only the owner can upload/update their own folder.

-- A. Allow public to read avatar images
CREATE POLICY "Avatar Public Read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- B. Allow users to upload their own avatar
-- (Folder name must match user ID)
CREATE POLICY "Avatar User Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- C. Allow users to update/delete their own avatar
CREATE POLICY "Avatar User Update" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar User Delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);
