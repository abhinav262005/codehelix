-- Add display_order column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Optional: Initialize existing users with an incremental order if you prefer,
-- but DEFAULT 0 is fine for now.
