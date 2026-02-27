
-- 1. Make user_id NOT NULL
ALTER TABLE public.builds ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.prompts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.resources ALTER COLUMN user_id SET NOT NULL;

-- 2. Add foreign keys with CASCADE (drop if exists from failed migration)
DO $$ BEGIN
  ALTER TABLE public.build_notes ADD CONSTRAINT build_notes_build_id_fkey FOREIGN KEY (build_id) REFERENCES public.builds(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.decisions ADD CONSTRAINT decisions_build_id_fkey FOREIGN KEY (build_id) REFERENCES public.builds(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.project_tasks ADD CONSTRAINT project_tasks_build_id_fkey FOREIGN KEY (build_id) REFERENCES public.builds(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.project_missions ADD CONSTRAINT project_missions_build_id_fkey FOREIGN KEY (build_id) REFERENCES public.builds(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.shipping_log ADD CONSTRAINT shipping_log_build_id_fkey FOREIGN KEY (build_id) REFERENCES public.builds(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.session_debriefs ADD CONSTRAINT session_debriefs_build_id_fkey FOREIGN KEY (build_id) REFERENCES public.builds(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.saved_artifacts ADD CONSTRAINT saved_artifacts_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.public_artifacts(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Add missing indexes
CREATE INDEX IF NOT EXISTS idx_ideas_user ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_user ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_user ON public.resources(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_user ON public.builds(user_id);
CREATE INDEX IF NOT EXISTS idx_build_notes_build ON public.build_notes(build_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_target ON public.follow_requests(target_id);

-- 4. Add updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_ideas_updated_at ON public.ideas;
CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON public.project_tasks;
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_missions_updated_at ON public.project_missions;
CREATE TRIGGER update_project_missions_updated_at
  BEFORE UPDATE ON public.project_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
