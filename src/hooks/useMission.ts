import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Mission {
  id: string;
  build_id: string;
  priority: string;
  next_step: string;
  time_estimate: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useMission(buildId: string) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMission = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_missions")
      .select("*")
      .eq("build_id", buildId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setMission(data as Mission);
    } else {
      setMission(null);
    }
    setLoading(false);
  }, [buildId]);

  useEffect(() => {
    fetchMission();
  }, [fetchMission]);

  const upsertMission = async (fields: { priority: string; next_step: string; time_estimate?: string }) => {
    if (mission) {
      const { data, error } = await supabase
        .from("project_missions")
        .update(fields)
        .eq("id", mission.id)
        .select()
        .single();
      if (!error && data) setMission(data as Mission);
      return !error;
    } else {
      const { data, error } = await supabase
        .from("project_missions")
        .insert({ build_id: buildId, ...fields })
        .select()
        .single();
      if (!error && data) setMission(data as Mission);
      return !error;
    }
  };

  return { mission, loading, upsertMission, refetch: fetchMission };
}
