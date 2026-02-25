
-- Create builds table
CREATE TABLE public.builds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'in-progress', 'paused', 'shipped')),
  lovable_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create build_notes table (separate table for timeline notes)
CREATE TABLE public.build_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_notes ENABLE ROW LEVEL SECURITY;

-- Public RLS policies for builds
CREATE POLICY "Allow public read builds" ON public.builds FOR SELECT USING (true);
CREATE POLICY "Allow public insert builds" ON public.builds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update builds" ON public.builds FOR UPDATE USING (true);
CREATE POLICY "Allow public delete builds" ON public.builds FOR DELETE USING (true);

-- Public RLS policies for build_notes
CREATE POLICY "Allow public read build_notes" ON public.build_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert build_notes" ON public.build_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete build_notes" ON public.build_notes FOR DELETE USING (true);

-- Trigger to auto-update updated_at on builds
CREATE OR REPLACE FUNCTION public.update_build_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_builds_updated_at
  BEFORE UPDATE ON public.builds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_build_updated_at();

-- Trigger to bump parent build's updated_at when a note is added
CREATE OR REPLACE FUNCTION public.bump_build_on_note()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.builds SET updated_at = now() WHERE id = NEW.build_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER bump_build_on_note_insert
  AFTER INSERT ON public.build_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_build_on_note();
