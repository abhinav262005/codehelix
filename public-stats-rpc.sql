-- =====================================================
-- CodeHelix — Public Stats RPC
-- Run this in your Supabase project SQL editor
-- Project: Settings → SQL Editor → New Query
-- =====================================================

-- This function bypasses RLS (SECURITY DEFINER) to safely return 
-- just the total counts for the landing page without exposing any row data.
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'problems', (SELECT count(*) FROM public.problems),
    'solutions', (SELECT count(*) FROM public.solutions),
    'members', (SELECT count(*) FROM public.profiles WHERE role != 'admin')
  );
$$;
