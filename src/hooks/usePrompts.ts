import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrompts = useCallback(async () => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPrompts(data as Prompt[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const addPrompt = async (prompt: { title: string; content: string; tags: string[] }) => {
    const optimistic: Prompt = {
      id: crypto.randomUUID(),
      title: prompt.title,
      content: prompt.content,
      tags: prompt.tags,
      created_at: new Date().toISOString(),
    };
    setPrompts((prev) => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("prompts")
      .insert({ title: prompt.title, content: prompt.content, tags: prompt.tags })
      .select()
      .single();

    if (error) {
      setPrompts((prev) => prev.filter((p) => p.id !== optimistic.id));
      return null;
    }
    setPrompts((prev) => prev.map((p) => (p.id === optimistic.id ? (data as Prompt) : p)));
    return data as Prompt;
  };

  const deletePrompt = async (id: string) => {
    const backup = prompts;
    setPrompts((prev) => prev.filter((p) => p.id !== id));

    const { error } = await supabase.from("prompts").delete().eq("id", id);
    if (error) {
      setPrompts(backup);
      return false;
    }
    return true;
  };

  const allTags = Array.from(new Set(prompts.flatMap((p) => p.tags)));

  return { prompts, loading, addPrompt, deletePrompt, allTags, refetch: fetchPrompts };
}
