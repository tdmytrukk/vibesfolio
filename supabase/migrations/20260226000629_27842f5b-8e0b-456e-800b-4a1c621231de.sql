
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.create_profile_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_on_signup();

-- 2. Add user_id to existing tables
ALTER TABLE public.builds ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.prompts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.resources ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Drop old permissive-false policies and create user-scoped ones

-- builds
DROP POLICY IF EXISTS "Allow public delete builds" ON public.builds;
DROP POLICY IF EXISTS "Allow public insert builds" ON public.builds;
DROP POLICY IF EXISTS "Allow public read builds" ON public.builds;
DROP POLICY IF EXISTS "Allow public update builds" ON public.builds;

CREATE POLICY "Users can read own builds" ON public.builds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own builds" ON public.builds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own builds" ON public.builds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own builds" ON public.builds FOR DELETE USING (auth.uid() = user_id);

-- build_notes (user_id via builds join)
DROP POLICY IF EXISTS "Allow public delete build_notes" ON public.build_notes;
DROP POLICY IF EXISTS "Allow public insert build_notes" ON public.build_notes;
DROP POLICY IF EXISTS "Allow public read build_notes" ON public.build_notes;

CREATE POLICY "Users can read own build_notes" ON public.build_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.builds WHERE builds.id = build_notes.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can insert own build_notes" ON public.build_notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.builds WHERE builds.id = build_notes.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can delete own build_notes" ON public.build_notes FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.builds WHERE builds.id = build_notes.build_id AND builds.user_id = auth.uid()));

-- prompts
DROP POLICY IF EXISTS "Allow public delete" ON public.prompts;
DROP POLICY IF EXISTS "Allow public insert" ON public.prompts;
DROP POLICY IF EXISTS "Allow public read" ON public.prompts;
DROP POLICY IF EXISTS "Allow public update" ON public.prompts;

CREATE POLICY "Users can read own prompts" ON public.prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prompts" ON public.prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prompts" ON public.prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prompts" ON public.prompts FOR DELETE USING (auth.uid() = user_id);

-- resources
DROP POLICY IF EXISTS "Allow public delete resources" ON public.resources;
DROP POLICY IF EXISTS "Allow public insert resources" ON public.resources;
DROP POLICY IF EXISTS "Allow public read resources" ON public.resources;

CREATE POLICY "Users can read own resources" ON public.resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON public.resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON public.resources FOR DELETE USING (auth.uid() = user_id);
