import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  created_at: string;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  const generateSummary = async (promptId: string, title: string, content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", {
        body: { prompt_id: promptId, title, content },
      });
      if (error) throw error;
      const summary = data?.summary as string | null;
      if (summary) {
        setPrompts((prev) =>
          prev.map((p) => (p.id === promptId ? { ...p, summary } : p))
        );
      }
      return summary;
    } catch (err) {
      console.error("Failed to generate summary:", err);
      return null;
    }
  };

  const addPrompt = async (prompt: { title: string; content: string; tags: string[] }) => {
    const optimistic: Prompt = {
      id: crypto.randomUUID(),
      title: prompt.title,
      content: prompt.content,
      summary: null,
      tags: prompt.tags,
      created_at: new Date().toISOString(),
    };
    setPrompts((prev) => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("prompts")
      .insert({ title: prompt.title, content: prompt.content, tags: prompt.tags, user_id: user?.id })
      .select()
      .single();

    if (error) {
      setPrompts((prev) => prev.filter((p) => p.id !== optimistic.id));
      return null;
    }
    const saved = data as Prompt;
    setPrompts((prev) => prev.map((p) => (p.id === optimistic.id ? saved : p)));

    // Generate summary in the background
    generateSummary(saved.id, saved.title, saved.content);

    return saved;
  };

  const updatePrompt = async (id: string, updates: { title: string; content: string; tags: string[] }) => {
    const backup = prompts;
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    const { error } = await supabase
      .from("prompts")
      .update({ title: updates.title, content: updates.content, tags: updates.tags })
      .eq("id", id);

    if (error) {
      setPrompts(backup);
      return false;
    }

    // Re-generate summary since content may have changed
    generateSummary(id, updates.title, updates.content);

    return true;
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

  return { prompts, loading, addPrompt, updatePrompt, deletePrompt, allTags, refetch: fetchPrompts, generateSummary };
}
