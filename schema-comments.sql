-- =====================================================
-- CodeHelix — Comments Schema
-- Run this in your Supabase project SQL editor
-- Project: Settings → SQL Editor → New Query
-- =====================================================

DROP TABLE IF EXISTS public.comments CASCADE;

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
    created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 1. Anyone in the workspace can READ all comments
CREATE POLICY "Enable read access for all users" 
ON public.comments FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Anyone in the workspace can INSERT a comment
CREATE POLICY "Enable insert for authenticated users" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- 3. Users can UPDATE their own comments
CREATE POLICY "Users can update own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = created_by);

-- 4. Admins or the Comment Author can DELETE comments
CREATE POLICY "Enable delete for users based on user_id or admin role" 
ON public.comments FOR DELETE 
USING (
  auth.uid() = created_by OR public.is_admin()
);
