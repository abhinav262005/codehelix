-- =====================================================
-- CodeHelix — Extra Admin RPC Functions
-- Run this in your Supabase project SQL editor
-- Project: Settings → SQL Editor → New Query
-- =====================================================

-- ─── 3. Admin Get All Users ────────────────────────
-- Allows an admin to view all users, including their
-- secure email addresses from the auth.users table.
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id uuid,
  username text,
  role text,
  is_suspended boolean,
  created_at timestamptz,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- 1. Check if the caller is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can view this data.';
  END IF;

  -- 2. Return the joined table data
  RETURN QUERY
  SELECT 
    p.id, 
    p.username, 
    p.role, 
    p.is_suspended, 
    p.created_at, 
    u.email::text
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at ASC;
END;
$$;
