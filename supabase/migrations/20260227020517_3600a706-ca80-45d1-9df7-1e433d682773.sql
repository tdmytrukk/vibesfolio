
-- Public artifacts table (shared prompts & resources)
CREATE TABLE public.public_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('prompt', 'resource')),
  title TEXT NOT NULL,
  description TEXT,
  -- Prompt-specific fields
  prompt_content TEXT,
  prompt_use_case TEXT,
  prompt_context TEXT,
  recommended_model TEXT,
  -- Resource-specific fields
  resource_url TEXT,
  resource_category TEXT,
  resource_note TEXT,
  resource_when_to_use TEXT,
  -- Common
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.public_artifacts ENABLE ROW LEVEL SECURITY;

-- Anyone can read public artifacts
CREATE POLICY "Anyone can read public artifacts"
  ON public.public_artifacts FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Users can insert their own
CREATE POLICY "Users can insert own artifacts"
  ON public.public_artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "Users can update own artifacts"
  ON public.public_artifacts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "Users can delete own artifacts"
  ON public.public_artifacts FOR DELETE
  USING (auth.uid() = user_id);

-- Saved artifacts (library)
CREATE TABLE public.saved_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artifact_id UUID NOT NULL REFERENCES public.public_artifacts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, artifact_id)
);

ALTER TABLE public.saved_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saves"
  ON public.saved_artifacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
  ON public.saved_artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
  ON public.saved_artifacts FOR DELETE
  USING (auth.uid() = user_id);

-- Follow relationships
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own follows"
  ON public.follows FOR SELECT
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can insert own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Add updated_at trigger for public_artifacts
CREATE TRIGGER update_public_artifacts_updated_at
  BEFORE UPDATE ON public.public_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_build_updated_at();

-- Index for feed queries
CREATE INDEX idx_public_artifacts_public ON public.public_artifacts(is_public, created_at DESC);
CREATE INDEX idx_public_artifacts_user ON public.public_artifacts(user_id);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_saved_artifacts_user ON public.saved_artifacts(user_id);
