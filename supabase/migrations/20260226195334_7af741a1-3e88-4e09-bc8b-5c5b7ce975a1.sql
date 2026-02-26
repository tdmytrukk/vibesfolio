
-- Current mission per project (one active at a time)
CREATE TABLE public.project_missions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  build_id uuid NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  priority text NOT NULL DEFAULT '',
  next_step text NOT NULL DEFAULT '',
  time_estimate text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Execution board tasks
CREATE TABLE public.project_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  build_id uuid NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  title text NOT NULL,
  bucket text NOT NULL DEFAULT 'backlog' CHECK (bucket IN ('today', 'next', 'backlog')),
  is_done boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.project_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Missions RLS: access via build ownership
CREATE POLICY "Users can read own missions" ON public.project_missions FOR SELECT
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = project_missions.build_id AND builds.user_id = auth.uid()));

CREATE POLICY "Users can insert own missions" ON public.project_missions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM builds WHERE builds.id = project_missions.build_id AND builds.user_id = auth.uid()));

CREATE POLICY "Users can update own missions" ON public.project_missions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = project_missions.build_id AND builds.user_id = auth.uid()));

CREATE POLICY "Users can delete own missions" ON public.project_missions FOR DELETE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = project_missions.build_id AND builds.user_id = auth.uid()));

-- Tasks RLS: access via build ownership
CREATE POLICY "Users can read own tasks" ON public.project_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = project_tasks.build_id AND builds.user_id = auth.uid()));

CREATE POLICY "Users can insert own tasks" ON public.project_tasks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM builds WHERE builds.id = project_tasks.build_id AND builds.user_id = auth.uid()));

CREATE POLICY "Users can update own tasks" ON public.project_tasks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = project_tasks.build_id AND builds.user_id = auth.uid()));

CREATE POLICY "Users can delete own tasks" ON public.project_tasks FOR DELETE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = project_tasks.build_id AND builds.user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_project_missions_build ON public.project_missions(build_id);
CREATE INDEX idx_project_tasks_build_bucket ON public.project_tasks(build_id, bucket);

-- Auto-update timestamps
CREATE TRIGGER update_project_missions_updated_at
  BEFORE UPDATE ON public.project_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_build_updated_at();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_build_updated_at();
