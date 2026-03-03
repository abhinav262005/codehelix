-- =====================================================
-- CodeHelix — Admin RPC Functions
-- Run this in your Supabase project SQL editor
-- Project: Settings → SQL Editor → New Query
-- =====================================================

-- ─── 1. Admin Update User Password ───────────────────
-- Allows an admin to forcefully change another user's password.
-- Bypasses normal auth flows (no old password required).
CREATE OR REPLACE FUNCTION public.admin_update_user_password(
  target_user_id uuid,
  new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- 1. Check if the caller is an admin using our existing function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can update passwords.';
  END IF;

  -- 2. Update the user's password in the auth.users table
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_user_id;

  -- 3. Check if the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  RETURN true;
END;
$$;


-- ─── 2. Admin Update User Email ──────────────────────
-- Allows an admin to forcefully change another user's email address.
-- Bypasses normal email confirmation flows.
CREATE OR REPLACE FUNCTION public.admin_update_user_email(
  target_user_id uuid,
  new_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- 1. Check if the caller is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can update emails.';
  END IF;

  -- 2. Update the user's email in the auth.users table
  -- We also update email_confirmed_at to auto-confirm it
  UPDATE auth.users
  SET 
    email = new_email,
    email_confirmed_at = now(),
    updated_at = now()
  WHERE id = target_user_id;

  -- 3. Check if the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  RETURN true;
END;
$$;

-- Note: In Supabase, these functions run with postgres role privileges 
-- because of SECURITY DEFINER, allowing them to mutate the auth schema, 
-- which normal users cannot do.
