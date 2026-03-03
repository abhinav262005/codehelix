-- =====================================================
-- CodeHelix — Supabase Database Schema (Fixed)
-- Run this in your Supabase project SQL editor
-- Project: Settings → SQL Editor → New Query
-- =====================================================

-- ─── Extensions ─────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. Profiles Table (MUST come before is_admin()) ─
CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text NOT NULL UNIQUE,
  role         text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  is_suspended boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. Helper Function: is_admin() ──────────────────
-- Now safe to create because profiles table exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─── 3. Profiles RLS Policies ────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated user
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Insert: user can only insert their own profile
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Update: own profile OR admin
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- Delete: admin only
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (is_admin());

-- ─── 4. Problems Table ───────────────────────────────
CREATE TABLE public.problems (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text NOT NULL,
  difficulty    text NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  input_format  text,
  output_format text,
  example       text,
  tags          text[] DEFAULT '{}',
  starter_code  text,
  created_by    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "problems_select" ON public.problems
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "problems_insert" ON public.problems
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "problems_update" ON public.problems
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin());

CREATE POLICY "problems_delete" ON public.problems
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR is_admin());

-- ─── 5. Solutions Table ──────────────────────────────
CREATE TABLE public.solutions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id  uuid NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  language    text NOT NULL,
  runtime_ms  integer,
  content     text NOT NULL,
  explanation text,
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- One solution per user per problem
  UNIQUE (problem_id, created_by)
);

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "solutions_select" ON public.solutions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "solutions_insert" ON public.solutions
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "solutions_update" ON public.solutions
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin());

CREATE POLICY "solutions_delete" ON public.solutions
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR is_admin());

-- ─── 6. Auto-create Profile on Signup ────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Done ────────────────────────────────────────────
-- After running this, run setup-users.js to create users.
-- Or promote an existing user to admin with:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE id = (
--     SELECT id FROM auth.users WHERE email = 'admin@codehelix.local'
--   );
