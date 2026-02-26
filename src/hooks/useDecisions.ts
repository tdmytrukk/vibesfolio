import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Decision {
  id: string;
  build_id: string;
  title: string;
  context: string | null;
  outcome: string | null;
  created_at: string;
}

export const useDecisions = (buildId: string) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("decisions")
      .select("*")
      .eq("build_id", buildId)
      .order("created_at", { ascending: false });
    if (data) setDecisions(data as Decision[]);
    setLoading(false);
  }, [buildId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addDecision = async (d: { title: string; context?: string; outcome?: string }) => {
    const { data, error } = await supabase
      .from("decisions")
      .insert({ build_id: buildId, ...d })
      .select()
      .single();
    if (error) return null;
    setDecisions((prev) => [data as Decision, ...prev]);
    return data;
  };

  const deleteDecision = async (id: string) => {
    await supabase.from("decisions").delete().eq("id", id);
    setDecisions((prev) => prev.filter((d) => d.id !== id));
  };

  return { decisions, loading, addDecision, deleteDecision };
};
