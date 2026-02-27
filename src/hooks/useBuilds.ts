import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type BuildStatus = "idea" | "in-progress" | "paused" | "shipped";

export interface BuildNote {
  id: string;
  build_id: string;
  text: string;
  created_at: string;
}

export interface Build {
  id: string;
  name: string;
  description: string | null;
  status: BuildStatus;
  lovable_url: string | null;
  created_at: string;
  updated_at: string;
  notes?: BuildNote[];
}

export function useBuilds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBuilds = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("builds")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setBuilds(data as Build[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBuilds();
  }, [fetchBuilds]);

  const addBuild = async (build: {
    name: string;
    description?: string;
    status: BuildStatus;
    lovable_url?: string;
  }) => {
    const optimistic: Build = {
      id: crypto.randomUUID(),
      name: build.name,
      description: build.description || null,
      status: build.status,
      lovable_url: build.lovable_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setBuilds((prev) => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("builds")
      .insert({
        name: build.name,
        description: build.description || null,
        status: build.status,
        lovable_url: build.lovable_url || null,
        user_id: user?.id,
      })
      .select()
      .single();

    if (error) {
      setBuilds((prev) => prev.filter((b) => b.id !== optimistic.id));
      return null;
    }
    setBuilds((prev) =>
      prev.map((b) => (b.id === optimistic.id ? (data as Build) : b))
    );
    return data as Build;
  };

  const updateBuild = async (
    id: string,
    updates: Partial<Pick<Build, "name" | "description" | "status" | "lovable_url">>
  ) => {
    const backup = builds;
    setBuilds((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b))
    );

    const { error } = await supabase
      .from("builds")
      .update(updates)
      .eq("id", id);

    if (error) {
      setBuilds(backup);
      return false;
    }
    return true;
  };

  const deleteBuild = async (id: string) => {
    const backup = builds;
    setBuilds((prev) => prev.filter((b) => b.id !== id));

    const { error } = await supabase.from("builds").delete().eq("id", id);
    if (error) {
      setBuilds(backup);
      return false;
    }
    return true;
  };

  // Notes
  const fetchNotes = async (buildId: string): Promise<BuildNote[]> => {
    const { data, error } = await supabase
      .from("build_notes")
      .select("*")
      .eq("build_id", buildId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as BuildNote[];
  };

  const addNote = async (buildId: string, text: string) => {
    const { data, error } = await supabase
      .from("build_notes")
      .insert({ build_id: buildId, text })
      .select()
      .single();

    if (error) return null;

    // Bump local updated_at so sort order updates
    setBuilds((prev) =>
      prev.map((b) =>
        b.id === buildId ? { ...b, updated_at: new Date().toISOString() } : b
      )
    );

    return data as BuildNote;
  };

  return {
    builds,
    loading,
    addBuild,
    updateBuild,
    deleteBuild,
    fetchNotes,
    addNote,
    refetch: fetchBuilds,
  };
}
