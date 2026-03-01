-- 5A.5: Add updated_at triggers for project_tasks and project_missions only
-- ideas trigger already exists

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON public.project_tasks;
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_missions_updated_at ON public.project_missions;
CREATE TRIGGER update_project_missions_updated_at
  BEFORE UPDATE ON public.project_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();