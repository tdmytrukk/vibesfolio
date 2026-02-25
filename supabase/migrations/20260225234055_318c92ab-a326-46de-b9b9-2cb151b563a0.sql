
-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('inspiration', 'templates', 'tools', 'learning', 'other')),
  description TEXT,
  domain TEXT,
  cover_image_url TEXT,
  favicon_url TEXT,
  og_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Public access (tighten when auth is added)
CREATE POLICY "Allow public read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow public insert resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete resources" ON public.resources FOR DELETE USING (true);
