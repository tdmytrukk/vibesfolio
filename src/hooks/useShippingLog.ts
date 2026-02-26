import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ShipEntryType = "shipped" | "improved" | "decided" | "removed" | "experimented";

export interface ShipEntry {
  id: string;
  build_id: string;
  entry_type: ShipEntryType;
  title: string;
  description: string | null;
  created_at: string;
}

export const useShippingLog = (buildId: string) => {
  const [entries, setEntries] = useState<ShipEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("shipping_log")
      .select("*")
      .eq("build_id", buildId)
      .order("created_at", { ascending: false });
    if (data) setEntries(data as ShipEntry[]);
    setLoading(false);
  }, [buildId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addEntry = async (entry: { entry_type: ShipEntryType; title: string; description?: string }) => {
    const { data, error } = await supabase
      .from("shipping_log")
      .insert({ build_id: buildId, ...entry })
      .select()
      .single();
    if (error) return null;
    setEntries((prev) => [data as ShipEntry, ...prev]);
    return data;
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("shipping_log").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, loading, addEntry, deleteEntry };
};
