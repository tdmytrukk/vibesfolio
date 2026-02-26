import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TaskBucket = "today" | "next" | "backlog";

export interface ProjectTask {
  id: string;
  build_id: string;
  title: string;
  bucket: TaskBucket;
  is_done: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useTasks(buildId: string) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("build_id", buildId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data) {
      setTasks(data as ProjectTask[]);
    }
    setLoading(false);
  }, [buildId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string, bucket: TaskBucket = "backlog") => {
    const maxPos = tasks.filter((t) => t.bucket === bucket).reduce((max, t) => Math.max(max, t.position), -1);
    const optimistic: ProjectTask = {
      id: crypto.randomUUID(),
      build_id: buildId,
      title,
      bucket,
      is_done: false,
      position: maxPos + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, optimistic]);

    const { data, error } = await supabase
      .from("project_tasks")
      .insert({ build_id: buildId, title, bucket, position: maxPos + 1 })
      .select()
      .single();

    if (error) {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      return null;
    }
    setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? (data as ProjectTask) : t)));
    return data as ProjectTask;
  };

  const updateTask = async (id: string, updates: Partial<Pick<ProjectTask, "title" | "bucket" | "is_done" | "position">>) => {
    const backup = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    const { error } = await supabase.from("project_tasks").update(updates).eq("id", id);
    if (error) {
      setTasks(backup);
      return false;
    }
    return true;
  };

  const deleteTask = async (id: string) => {
    const backup = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("project_tasks").delete().eq("id", id);
    if (error) {
      setTasks(backup);
      return false;
    }
    return true;
  };

  const byBucket = (bucket: TaskBucket) =>
    tasks.filter((t) => t.bucket === bucket).sort((a, b) => a.position - b.position);

  return { tasks, loading, addTask, updateTask, deleteTask, byBucket, refetch: fetchTasks };
}
