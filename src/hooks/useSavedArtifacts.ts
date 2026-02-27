import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useSavedArtifacts() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const fetchSaved = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_artifacts")
      .select("artifact_id")
      .eq("user_id", user.id);

    setSavedIds(new Set((data || []).map((s: any) => s.artifact_id)));
  }, [user]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const saveArtifact = async (artifactId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from("saved_artifacts")
      .insert({ user_id: user.id, artifact_id: artifactId });

    if (error) return false;
    setSavedIds((prev) => new Set([...prev, artifactId]));
    return true;
  };

  const unsaveArtifact = async (artifactId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from("saved_artifacts")
      .delete()
      .eq("user_id", user.id)
      .eq("artifact_id", artifactId);

    if (error) return false;
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(artifactId);
      return next;
    });
    return true;
  };

  const isSaved = (artifactId: string) => savedIds.has(artifactId);

  return { savedIds, isSaved, saveArtifact, unsaveArtifact, refetch: fetchSaved };
}
