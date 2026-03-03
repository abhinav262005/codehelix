-- CodeHelix Complexity Fields
-- Add separate columns for Time and Space Complexity to the solutions table

-- 1. Add columns
ALTER TABLE public.solutions 
ADD COLUMN IF NOT EXISTS time_complexity TEXT,
ADD COLUMN IF NOT EXISTS space_complexity TEXT;

-- 2. Success message
SELECT 'Complexity columns added successfully!' as status;
