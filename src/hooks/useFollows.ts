import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FollowedUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface FollowRequest {
  id: string;
  requester_id: string;
  target_id: string;
  status: string;
  created_at: string;
  // joined
  requester_name?: string;
  requester_avatar?: string;
}

export function useFollows() {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followingUsers, setFollowingUsers] = useState<FollowedUser[]>([]);
  const [pendingOutgoing, setPendingOutgoing] = useState<Set<string>>(new Set());
  const [incomingRequests, setIncomingRequests] = useState<FollowRequest[]>([]);
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

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    // Outgoing pending requests
    const { data: outgoing } = await supabase
      .from("follow_requests")
      .select("target_id")
      .eq("requester_id", user.id)
      .eq("status", "pending");

    setPendingOutgoing(new Set((outgoing || []).map((r: any) => r.target_id)));

    // Incoming pending requests
    const { data: incoming } = await supabase
      .from("follow_requests")
      .select("*")
      .eq("target_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (incoming && incoming.length > 0) {
      const requesterIds = incoming.map((r: any) => r.requester_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", requesterIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      setIncomingRequests(
        incoming.map((r: any) => {
          const p = profileMap.get(r.requester_id);
          return {
            ...r,
            requester_name: p?.display_name || "Builder",
            requester_avatar: p?.avatar_url || null,
          };
        })
      );
    } else {
      setIncomingRequests([]);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowing();
    fetchRequests();
  }, [fetchFollowing, fetchRequests]);

  // Send a follow request (for private profiles)
  const sendFollowRequest = async (targetId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from("follow_requests")
      .insert({ requester_id: user.id, target_id: targetId });

    if (error) return false;
    setPendingOutgoing((prev) => new Set([...prev, targetId]));
    return true;
  };

  // Cancel outgoing request
  const cancelFollowRequest = async (targetId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from("follow_requests")
      .delete()
      .eq("requester_id", user.id)
      .eq("target_id", targetId);

    if (error) return false;
    setPendingOutgoing((prev) => {
      const next = new Set(prev);
      next.delete(targetId);
      return next;
    });
    return true;
  };

  // Accept incoming request
  const acceptRequest = async (requestId: string, requesterId: string) => {
    if (!user) return false;
    // Update request status
    const { error: updateErr } = await supabase
      .from("follow_requests")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateErr) return false;

    // Create the follow relationship
    const { error: followErr } = await supabase
      .from("follows")
      .insert({ follower_id: requesterId, following_id: user.id });

    if (followErr) return false;

    await fetchRequests();
    return true;
  };

  // Decline incoming request
  const declineRequest = async (requestId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from("follow_requests")
      .delete()
      .eq("id", requestId);

    if (error) return false;
    await fetchRequests();
    return true;
  };

  // Direct follow (for public profiles)
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
  const hasPendingRequest = (userId: string) => pendingOutgoing.has(userId);

  return {
    followingIds,
    followingUsers,
    isFollowing,
    hasPendingRequest,
    incomingRequests,
    follow,
    unfollow,
    sendFollowRequest,
    cancelFollowRequest,
    acceptRequest,
    declineRequest,
    refetch: fetchFollowing,
    refetchRequests: fetchRequests,
  };
}
