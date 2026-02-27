import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BuilderProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  artifact_count?: number;
}

export function useBuilders() {
  const [builders, setBuilders] = useState<BuilderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBuilders = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch all profiles except current user
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, email")
      .neq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !profiles) {
      setLoading(false);
      return;
    }

    // Fetch public artifact counts per user
    const { data: artifacts } = await supabase
      .from("public_artifacts")
      .select("user_id")
      .eq("is_public", true);

    const countMap = new Map<string, number>();
    (artifacts || []).forEach((a: any) => {
      countMap.set(a.user_id, (countMap.get(a.user_id) || 0) + 1);
    });

    const enriched: BuilderProfile[] = profiles.map((p: any) => ({
      ...p,
      artifact_count: countMap.get(p.user_id) || 0,
    }));

    // Sort: builders with artifacts first
    enriched.sort((a, b) => (b.artifact_count || 0) - (a.artifact_count || 0));

    setBuilders(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBuilders();
  }, [fetchBuilders]);

  return { builders, loading, refetch: fetchBuilders };
}
