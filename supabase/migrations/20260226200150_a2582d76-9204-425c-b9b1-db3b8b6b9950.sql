
-- Shipping Log: structured timeline entries
CREATE TABLE public.shipping_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id uuid NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  entry_type text NOT NULL DEFAULT 'shipped' CHECK (entry_type IN ('shipped', 'improved', 'decided', 'removed', 'experimented')),
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipping_log_build ON public.shipping_log(build_id);
ALTER TABLE public.shipping_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own shipping_log" ON public.shipping_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = shipping_log.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can insert own shipping_log" ON public.shipping_log FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM builds WHERE builds.id = shipping_log.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can update own shipping_log" ON public.shipping_log FOR UPDATE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = shipping_log.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can delete own shipping_log" ON public.shipping_log FOR DELETE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = shipping_log.build_id AND builds.user_id = auth.uid()));

-- Decisions: key decisions with context and outcome
CREATE TABLE public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id uuid NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  title text NOT NULL,
  context text,
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_decisions_build ON public.decisions(build_id);
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own decisions" ON public.decisions FOR SELECT
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = decisions.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can insert own decisions" ON public.decisions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM builds WHERE builds.id = decisions.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can update own decisions" ON public.decisions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = decisions.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can delete own decisions" ON public.decisions FOR DELETE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = decisions.build_id AND builds.user_id = auth.uid()));

-- Session Debriefs: structured reflection after build sessions
CREATE TABLE public.session_debriefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id uuid NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  what_shipped text,
  what_learned text,
  blockers text,
  next_session_plan text,
  mood text CHECK (mood IN ('great', 'good', 'meh', 'rough')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_debriefs_build ON public.session_debriefs(build_id);
ALTER TABLE public.session_debriefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own debriefs" ON public.session_debriefs FOR SELECT
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = session_debriefs.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can insert own debriefs" ON public.session_debriefs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM builds WHERE builds.id = session_debriefs.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can update own debriefs" ON public.session_debriefs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = session_debriefs.build_id AND builds.user_id = auth.uid()));
CREATE POLICY "Users can delete own debriefs" ON public.session_debriefs FOR DELETE
  USING (EXISTS (SELECT 1 FROM builds WHERE builds.id = session_debriefs.build_id AND builds.user_id = auth.uid()));
