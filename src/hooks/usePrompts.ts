import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PromptSection {
  id: string;
  name: string;
  content: string;
  position: number;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  created_at: string;
  sections: PromptSection[];
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPrompts = useCallback(async () => {
    if (!user) return;

    // Fetch prompts
    const { data: promptsData, error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (promptsError || !promptsData) {
      setLoading(false);
      return;
    }

    // Fetch all sections for these prompts
    const promptIds = promptsData.map((p) => p.id);
    let sectionsMap = new Map<string, PromptSection[]>();

    if (promptIds.length > 0) {
      const { data: sectionsData } = await supabase
        .from("prompt_sections")
        .select("*")
        .in("prompt_id", promptIds)
        .order("position", { ascending: true });

      if (sectionsData) {
        for (const s of sectionsData) {
          const arr = sectionsMap.get(s.prompt_id) || [];
          arr.push({ id: s.id, name: s.name, content: s.content, position: s.position });
          sectionsMap.set(s.prompt_id, arr);
        }
      }
    }

    const merged: Prompt[] = promptsData.map((p) => ({
      ...(p as any),
      sections: sectionsMap.get(p.id) || [],
    }));

    setPrompts(merged);
    setLoading(false);
  }, [user]);

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

  const addPrompt = async (prompt: {
    title: string;
    content: string;
    tags: string[];
    sections: { name: string; content: string; position: number }[];
  }) => {
    const optimistic: Prompt = {
      id: crypto.randomUUID(),
      title: prompt.title,
      content: prompt.content,
      summary: null,
      tags: prompt.tags,
      created_at: new Date().toISOString(),
      sections: prompt.sections.map((s) => ({ ...s, id: crypto.randomUUID() })),
    };
    setPrompts((prev) => [optimistic, ...prev]);

    // Concatenate sections for the content field
    const concatenated = prompt.sections.map((s) => `## ${s.name}\n${s.content}`).join("\n\n");

    const { data, error } = await supabase
      .from("prompts")
      .insert({
        title: prompt.title,
        content: concatenated || prompt.content,
        tags: prompt.tags,
        user_id: user?.id,
      })
      .select()
      .single();

    if (error) {
      setPrompts((prev) => prev.filter((p) => p.id !== optimistic.id));
      return null;
    }

    // Insert sections
    if (prompt.sections.length > 0) {
      const { data: sectionsData } = await supabase
        .from("prompt_sections")
        .insert(
          prompt.sections.map((s) => ({
            prompt_id: data.id,
            name: s.name,
            content: s.content,
            position: s.position,
          }))
        )
        .select();

      const savedSections: PromptSection[] = (sectionsData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        content: s.content,
        position: s.position,
      }));

      const saved: Prompt = { ...(data as any), sections: savedSections };
      setPrompts((prev) => prev.map((p) => (p.id === optimistic.id ? saved : p)));
      generateSummary(saved.id, saved.title, concatenated || prompt.content);
      return saved;
    }

    const saved: Prompt = { ...(data as any), sections: [] };
    setPrompts((prev) => prev.map((p) => (p.id === optimistic.id ? saved : p)));
    generateSummary(saved.id, saved.title, saved.content);
    return saved;
  };

  const updatePrompt = async (
    id: string,
    updates: {
      title: string;
      content: string;
      tags: string[];
      sections: { name: string; content: string; position: number }[];
    }
  ) => {
    const backup = prompts;
    const concatenated = updates.sections.map((s) => `## ${s.name}\n${s.content}`).join("\n\n");

    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              content: concatenated || updates.content,
              sections: updates.sections.map((s) => ({ ...s, id: crypto.randomUUID() })),
            }
          : p
      )
    );

    const { error } = await supabase
      .from("prompts")
      .update({
        title: updates.title,
        content: concatenated || updates.content,
        tags: updates.tags,
      })
      .eq("id", id);

    if (error) {
      setPrompts(backup);
      return false;
    }

    // Replace sections: delete old, insert new
    await supabase.from("prompt_sections").delete().eq("prompt_id", id);

    if (updates.sections.length > 0) {
      const { data: sectionsData } = await supabase
        .from("prompt_sections")
        .insert(
          updates.sections.map((s) => ({
            prompt_id: id,
            name: s.name,
            content: s.content,
            position: s.position,
          }))
        )
        .select();

      const savedSections: PromptSection[] = (sectionsData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        content: s.content,
        position: s.position,
      }));

      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, sections: savedSections } : p))
      );
    }

    generateSummary(id, updates.title, concatenated || updates.content);
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
