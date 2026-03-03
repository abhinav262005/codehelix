-- Add accent_color column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#00ffa3';

-- Update RLS policies just in case, though they usually cover all columns
-- Users can update their own profile (including accent_color)
-- Profiles are publicly readable (already covered by existing policies)
