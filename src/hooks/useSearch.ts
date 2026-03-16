import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SearchResult {
  id: string;
  title: string;
  type: "idea" | "prompt" | "resource";
  subtitle?: string;
  tags: string[];
}

export function useSearch(query: string) {
  const [results, setResults] = useState<{
    ideas: SearchResult[];
    prompts: SearchResult[];
    resources: SearchResult[];
  }>({ ideas: [], prompts: [], resources: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(
    async (q: string) => {
      if (!user || q.length < 2) {
        setResults({ ideas: [], prompts: [], resources: [] });
        return;
      }

      setLoading(true);
      const pattern = `%${q}%`;

      const [ideasRes, promptsRes, resourcesRes] = await Promise.all([
        supabase
          .from("ideas")
          .select("id, title, tags, note")
          .eq("user_id", user.id)
          .ilike("title", pattern)
          .limit(5),
        supabase
          .from("prompts")
          .select("id, title, tags, summary")
          .eq("user_id", user.id)
          .ilike("title", pattern)
          .limit(5),
        supabase
          .from("resources")
          .select("id, title, tags, description, domain")
          .eq("user_id", user.id)
          .ilike("title", pattern)
          .limit(5),
      ]);

      setResults({
        ideas: (ideasRes.data || []).map((i) => ({
          id: i.id,
          title: i.title,
          type: "idea" as const,
          subtitle: i.note || undefined,
          tags: i.tags || [],
        })),
        prompts: (promptsRes.data || []).map((p) => ({
          id: p.id,
          title: p.title,
          type: "prompt" as const,
          subtitle: p.summary || undefined,
          tags: p.tags || [],
        })),
        resources: (resourcesRes.data || []).map((r) => ({
          id: r.id,
          title: r.title,
          type: "resource" as const,
          subtitle: r.domain || r.description || undefined,
          tags: r.tags || [],
        })),
      });
      setLoading(false);
    },
    [user],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const totalCount =
    results.ideas.length + results.prompts.length + results.resources.length;

  return { results, loading, totalCount };
}
