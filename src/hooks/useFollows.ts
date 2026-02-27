import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FollowedUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useFollows() {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followingUsers, setFollowingUsers] = useState<FollowedUser[]>([]);
  const { user } = useAuth();

  const fetchFollowing = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const ids = (data || []).map((f: any) => f.following_id);
    setFollowingIds(new Set(ids));

    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids);

      setFollowingUsers((profiles || []) as FollowedUser[]);
    } else {
      setFollowingUsers([]);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  const follow = async (userId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: userId });

    if (error) return false;
    setFollowingIds((prev) => new Set([...prev, userId]));
    await fetchFollowing();
    return true;
  };

  const unfollow = async (userId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", userId);

    if (error) return false;
    setFollowingIds((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
    await fetchFollowing();
    return true;
  };

  const isFollowing = (userId: string) => followingIds.has(userId);

  return { followingIds, followingUsers, isFollowing, follow, unfollow, refetch: fetchFollowing };
}
