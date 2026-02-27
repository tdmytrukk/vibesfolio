import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PublicArtifact {
  id: string;
  user_id: string;
  artifact_type: "prompt" | "resource";
  title: string;
  description: string | null;
  prompt_content: string | null;
  prompt_use_case: string | null;
  prompt_context: string | null;
  recommended_model: string | null;
  resource_url: string | null;
  resource_category: string | null;
  resource_note: string | null;
  resource_when_to_use: string | null;
  cover_image_url: string | null;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  creator_name?: string;
  creator_avatar?: string;
  is_saved?: boolean;
}

export function usePublicArtifacts() {
  const [artifacts, setArtifacts] = useState<PublicArtifact[]>([]);
  const [myArtifacts, setMyArtifacts] = useState<PublicArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch public artifacts
    const { data: publicData, error } = await supabase
      .from("public_artifacts")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !publicData) {
      setLoading(false);
      return;
    }

    // Fetch saved artifact IDs for current user
    const { data: savedData } = await supabase
      .from("saved_artifacts")
      .select("artifact_id")
      .eq("user_id", user.id);

    const savedIds = new Set((savedData || []).map((s: any) => s.artifact_id));

    // Fetch creator profiles
    const userIds = [...new Set(publicData.map((a: any) => a.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.user_id, p])
    );

    // Fetch following IDs
    const { data: followData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = new Set((followData || []).map((f: any) => f.following_id));

    const enriched: PublicArtifact[] = publicData.map((a: any) => {
      const profile = profileMap.get(a.user_id);
      return {
        ...a,
        creator_name: profile?.display_name || "Builder",
        creator_avatar: profile?.avatar_url || null,
        is_saved: savedIds.has(a.id),
        is_following: followingIds.has(a.user_id),
      };
    });

    setArtifacts(enriched);
    setLoading(false);
  }, [user]);

  const fetchMyArtifacts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("public_artifacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMyArtifacts(data as PublicArtifact[]);
    }
  }, [user]);

  useEffect(() => {
    fetchFeed();
    fetchMyArtifacts();
  }, [fetchFeed, fetchMyArtifacts]);

  const fetchUrlMetadata = async (url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-url-metadata", {
        body: { url },
      });
      if (error || !data?.success) return null;
      return data as { domain: string; ogImage: string | null; ogTitle: string | null; faviconUrl: string };
    } catch {
      return null;
    }
  };

  const publishArtifact = async (artifact: {
    artifact_type: "prompt" | "resource";
    title: string;
    description?: string;
    prompt_content?: string;
    prompt_use_case?: string;
    prompt_context?: string;
    recommended_model?: string;
    resource_url?: string;
    resource_category?: string;
    resource_note?: string;
    resource_when_to_use?: string;
    tags?: string[];
    is_public?: boolean;
  }) => {
    if (!user) return null;

    // Fetch cover image for resource artifacts
    let coverImageUrl: string | null = null;
    if (artifact.artifact_type === "resource" && artifact.resource_url) {
      const meta = await fetchUrlMetadata(artifact.resource_url);
      if (meta?.ogImage) coverImageUrl = meta.ogImage;
    }

    const { data, error } = await supabase
      .from("public_artifacts")
      .insert({
        ...artifact,
        user_id: user.id,
        tags: artifact.tags || [],
        is_public: artifact.is_public ?? true,
        cover_image_url: coverImageUrl,
      } as any)
      .select()
      .single();

    if (error) return null;
    await fetchMyArtifacts();
    await fetchFeed();
    return data as PublicArtifact;
  };

  const updateArtifact = async (id: string, updates: Partial<PublicArtifact>) => {
    const { error } = await supabase
      .from("public_artifacts")
      .update(updates)
      .eq("id", id);

    if (error) return false;
    await fetchMyArtifacts();
    await fetchFeed();
    return true;
  };

  const deleteArtifact = async (id: string) => {
    const { error } = await supabase
      .from("public_artifacts")
      .delete()
      .eq("id", id);

    if (error) return false;
    await fetchMyArtifacts();
    return true;
  };

  const togglePublic = async (id: string, isPublic: boolean) => {
    return updateArtifact(id, { is_public: isPublic } as any);
  };

  return {
    artifacts,
    myArtifacts,
    loading,
    publishArtifact,
    updateArtifact,
    deleteArtifact,
    togglePublic,
    refetch: fetchFeed,
    refetchMy: fetchMyArtifacts,
  };
}
