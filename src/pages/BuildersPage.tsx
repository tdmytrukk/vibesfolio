import { useState, useMemo } from "react";
import { Search, UserPlus, UserCheck, Radio, ArrowLeft, Clock, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import { useBuilders } from "@/hooks/useBuilders";
import { useFollows } from "@/hooks/useFollows";
import { toast } from "@/hooks/use-toast";

const BuildersPage = () => {
  const navigate = useNavigate();
  const { builders, loading } = useBuilders();
  const {
    isFollowing,
    hasPendingRequest,
    follow,
    unfollow,
    sendFollowRequest,
    cancelFollowRequest,
  } = useFollows();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return builders;
    const q = search.toLowerCase();
    return builders.filter(
      (b) =>
        b.display_name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q)
    );
  }, [builders, search]);

  const handleFollowAction = async (builder: typeof builders[0]) => {
    const userId = builder.user_id;

    if (isFollowing(userId)) {
      await unfollow(userId);
      toast({ title: "Unfollowed." });
    } else if (hasPendingRequest(userId)) {
      await cancelFollowRequest(userId);
      toast({ title: "Request cancelled." });
    } else if (builder.is_public) {
      // Public profile: direct follow
      await follow(userId);
      toast({ title: "Following." });
    } else {
      // Private profile: send request
      const ok = await sendFollowRequest(userId);
      if (ok) toast({ title: "Follow request sent." });
      else toast({ title: "Request already sent.", variant: "destructive" });
    }
  };

  const getButtonState = (builder: typeof builders[0]) => {
    const userId = builder.user_id;
    if (isFollowing(userId)) {
      return { label: "Following", icon: <UserCheck size={13} />, variant: "secondary" as const };
    }
    if (hasPendingRequest(userId)) {
      return { label: "Requested", icon: <Clock size={13} />, variant: "outline" as const };
    }
    return { label: "Follow", icon: <UserPlus size={13} />, variant: "outline" as const };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => navigate("/community")}
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="font-heading text-3xl text-foreground">
            Builders
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse and follow builders in the community.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search builders..."
          className="pl-9 h-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Radio size={40} strokeWidth={1.2} />}
          title="No builders found"
          subtitle={search ? "Try a different search term." : "No public builders have joined yet."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((builder) => {
            const btnState = getButtonState(builder);
            return (
              <div
                key={builder.user_id}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 transition-all duration-200 hover:border-border hover:shadow-sm"
              >
                {/* Avatar */}
                {builder.avatar_url ? (
                  <img
                    src={builder.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                    {(builder.display_name || builder.email || "B").charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm font-semibold text-foreground truncate">
                    {builder.display_name || "Builder"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {builder.artifact_count !== undefined && builder.artifact_count > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {builder.artifact_count} artifact{builder.artifact_count !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Follow button */}
                <Button
                  variant={btnState.variant}
                  size="sm"
                  className="h-8 gap-1.5 text-xs shrink-0"
                  onClick={() => handleFollowAction(builder)}
                >
                  {btnState.icon}
                  {btnState.label}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuildersPage;
