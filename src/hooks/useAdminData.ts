import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profiles, prompts, resources, ideas, builds, artifacts, feedback] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("prompts").select("*", { count: "exact", head: true }),
          supabase.from("resources").select("*", { count: "exact", head: true }),
          supabase.from("ideas").select("*", { count: "exact", head: true }),
          supabase.from("builds").select("*", { count: "exact", head: true }),
          supabase.from("public_artifacts").select("*", { count: "exact", head: true }),
          supabase.from("feedback").select("*", { count: "exact", head: true }).eq("status", "new"),
        ]);
      return {
        totalUsers: profiles.count ?? 0,
        totalPrompts: prompts.count ?? 0,
        totalResources: resources.count ?? 0,
        totalIdeas: ideas.count ?? 0,
        totalBuilds: builds.count ?? 0,
        totalArtifacts: artifacts.count ?? 0,
        pendingFeedback: feedback.count ?? 0,
      };
    },
  });
}

export function useAdminProfiles() {
  return useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, email, created_at, is_public, avatar_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminFeedback() {
  const queryClient = useQueryClient();

  const feedbackQuery = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("feedback")
        .update({ status } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  return { ...feedbackQuery, updateStatus };
}

export function useAdminActivity() {
  return useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      // Get all profiles with their content counts
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, email");

      if (!profiles) return [];

      const userIds = profiles.map((p) => p.user_id);

      const [prompts, resources, ideas, builds] = await Promise.all([
        supabase.from("prompts").select("user_id"),
        supabase.from("resources").select("user_id"),
        supabase.from("ideas").select("user_id"),
        supabase.from("builds").select("user_id"),
      ]);

      const countMap: Record<string, number> = {};
      for (const id of userIds) countMap[id] = 0;
      for (const item of [...(prompts.data ?? []), ...(resources.data ?? []), ...(ideas.data ?? []), ...(builds.data ?? [])]) {
        if (countMap[item.user_id] !== undefined) countMap[item.user_id]++;
      }

      return profiles
        .map((p) => ({ ...p, contentCount: countMap[p.user_id] ?? 0 }))
        .sort((a, b) => b.contentCount - a.contentCount)
        .slice(0, 20);
    },
  });
}
