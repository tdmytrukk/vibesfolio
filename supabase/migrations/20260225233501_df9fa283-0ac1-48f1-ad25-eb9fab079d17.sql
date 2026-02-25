
-- Create prompts table
CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- For now, allow all access (no auth yet - user said optional)
-- These should be tightened when auth is added
CREATE POLICY "Allow public read" ON public.prompts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.prompts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.prompts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.prompts FOR DELETE USING (true);
