
-- Allow anyone authenticated to read all profiles (for builders directory)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
