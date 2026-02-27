import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Idea {
  id: string;
  title: string;
  note: string | null;
  tags: string[];
  links: string[];
  created_at: string;
  updated_at: string;
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchIdeas = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setIdeas(data as Idea[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const addIdea = async (idea: { title: string; note?: string; tags?: string[]; links?: string[] }) => {
    if (!user) return null;
    const optimistic: Idea = {
      id: crypto.randomUUID(),
      title: idea.title,
      note: idea.note || null,
      tags: idea.tags || [],
      links: idea.links || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setIdeas((prev) => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("ideas")
      .insert({
        title: idea.title,
        note: idea.note || null,
        tags: idea.tags || [],
        links: idea.links || [],
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      setIdeas((prev) => prev.filter((i) => i.id !== optimistic.id));
      return null;
    }
    setIdeas((prev) => prev.map((i) => (i.id === optimistic.id ? (data as Idea) : i)));
    return data as Idea;
  };

  const updateIdea = async (id: string, updates: Partial<Pick<Idea, "title" | "note" | "tags" | "links">>) => {
    const backup = ideas;
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));

    const { error } = await supabase.from("ideas").update(updates).eq("id", id);
    if (error) {
      setIdeas(backup);
      return false;
    }
    return true;
  };

  const deleteIdea = async (id: string) => {
    const backup = ideas;
    setIdeas((prev) => prev.filter((i) => i.id !== id));

    const { error } = await supabase.from("ideas").delete().eq("id", id);
    if (error) {
      setIdeas(backup);
      return false;
    }
    return true;
  };

  const allTags = Array.from(new Set(ideas.flatMap((i) => i.tags)));

  return { ideas, loading, addIdea, updateIdea, deleteIdea, allTags, refetch: fetchIdeas };
}
