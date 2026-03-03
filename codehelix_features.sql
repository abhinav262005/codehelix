-- CodeHelix New Features Setup
-- Run this in your Supabase SQL Editor

-- ==============================================================================
-- 1. Problem Bookmarks
-- Allows users to save problems for later
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.problem_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

ALTER TABLE public.problem_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" 
ON public.problem_bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" 
ON public.problem_bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.problem_bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- Success Message
SELECT 'Feature tables created successfully!' as status;
