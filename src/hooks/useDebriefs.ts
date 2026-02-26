import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DebriefMood = "great" | "good" | "meh" | "rough";

export interface Debrief {
  id: string;
  build_id: string;
  what_shipped: string | null;
  what_learned: string | null;
  blockers: string | null;
  next_session_plan: string | null;
  mood: DebriefMood | null;
  created_at: string;
}

export const useDebriefs = (buildId: string) => {
  const [debriefs, setDebriefs] = useState<Debrief[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("session_debriefs")
      .select("*")
      .eq("build_id", buildId)
      .order("created_at", { ascending: false });
    if (data) setDebriefs(data as Debrief[]);
    setLoading(false);
  }, [buildId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addDebrief = async (d: {
    what_shipped?: string;
    what_learned?: string;
    blockers?: string;
    next_session_plan?: string;
    mood?: DebriefMood;
  }) => {
    const { data, error } = await supabase
      .from("session_debriefs")
      .insert({ build_id: buildId, ...d })
      .select()
      .single();
    if (error) return null;
    setDebriefs((prev) => [data as Debrief, ...prev]);
    return data;
  };

  const deleteDebrief = async (id: string) => {
    await supabase.from("session_debriefs").delete().eq("id", id);
    setDebriefs((prev) => prev.filter((d) => d.id !== id));
  };

  return { debriefs, loading, addDebrief, deleteDebrief };
};
