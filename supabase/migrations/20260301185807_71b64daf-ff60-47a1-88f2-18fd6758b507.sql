
-- Create prompt_sections table
CREATE TABLE public.prompt_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_prompt_sections_prompt_id ON public.prompt_sections(prompt_id);

-- Enable RLS
ALTER TABLE public.prompt_sections ENABLE ROW LEVEL SECURITY;

-- RLS: users can CRUD sections via ownership of parent prompt
CREATE POLICY "Users can read own prompt_sections"
  ON public.prompt_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prompts
    WHERE prompts.id = prompt_sections.prompt_id AND prompts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own prompt_sections"
  ON public.prompt_sections FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prompts
    WHERE prompts.id = prompt_sections.prompt_id AND prompts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own prompt_sections"
  ON public.prompt_sections FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.prompts
    WHERE prompts.id = prompt_sections.prompt_id AND prompts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own prompt_sections"
  ON public.prompt_sections FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.prompts
    WHERE prompts.id = prompt_sections.prompt_id AND prompts.user_id = auth.uid()
  ));

-- Admin read access
CREATE POLICY "Admins can read all prompt_sections"
  ON public.prompt_sections FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing prompt content into sections
INSERT INTO public.prompt_sections (prompt_id, name, content, position)
SELECT id, title, content, 1 FROM public.prompts WHERE content IS NOT NULL AND content != '';
