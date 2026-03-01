import { useState, useMemo } from "react";
import { Search, Users, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtifactCard from "@/components/ArtifactCard";
import ArtifactDetailModal from "@/components/ArtifactDetailModal";
import PublishArtifactModal from "@/components/PublishArtifactModal";
import CopyToProjectModal from "@/components/CopyToProjectModal";
import FloatingActionButton from "@/components/FloatingActionButton";
import EmptyState from "@/components/EmptyState";
import { usePublicArtifacts, type PublicArtifact } from "@/hooks/usePublicArtifacts";
import { useSavedArtifacts } from "@/hooks/useSavedArtifacts";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/contexts/AuthContext";

const ITEMS_PER_PAGE = 12;

const CommunityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { artifacts, loading, publishArtifact } = usePublicArtifacts();
  const { isSaved, saveArtifact, unsaveArtifact } = useSavedArtifacts();
  const { isFollowing, follow, unfollow, followingIds } = useFollows();

  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<PublicArtifact | null>(null);
  const [copyArtifact, setCopyArtifact] = useState<PublicArtifact | null>(null);
  const [search, setSearch] = useState("");
  const [feedTab, setFeedTab] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = [...artifacts];

    items = items.map((a) =>
      a.user_id === user?.id ? { ...a, creator_name: "You" } : a
    );

    if (feedTab === "following") {
      items = items.filter((a) => a.user_id === user?.id || followingIds.has(a.user_id));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return items;
  }, [artifacts, feedTab, search, followingIds, user?.id]);

  const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="max-w-2xl lg:max-w-6xl mx-auto space-y-5 sm:space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search resources…"
          className="pl-11 h-11 rounded-full bg-card/80 border-border/20 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
        />
      </div>

      {/* Tabs + Builders */}
      <div className="flex items-center gap-2">
        <Tabs value={feedTab} onValueChange={(v) => { setFeedTab(v); setPage(1); }} className="flex-1">
          <TabsList className="h-9 bg-transparent p-0 gap-1">
            <TabsTrigger
              value="all"
              className="text-xs rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              Recently Added
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="text-xs rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-9 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/community/builders")}
        >
          <Users size={15} />
          <span className="hidden sm:inline">Builders</span>
        </Button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted/20 animate-pulse h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Radio size={40} strokeWidth={1.2} />}
          title={feedTab === "following" ? "No posts from people you follow" : "No posts yet"}
          subtitle={
            feedTab === "following"
              ? "Follow builders to see their shared tools and resources here."
              : "Be the first to share a tool or resource with the community."
          }
          actionLabel={feedTab === "following" ? "Browse builders" : "Share something"}
          onAction={feedTab === "following" ? () => navigate("/community/builders") : () => setPublishOpen(true)}
        />
      ) : (
        <>
          <div className="space-y-5 sm:space-y-6 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-5 lg:space-y-0">
            {paginated.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                onClick={setSelectedArtifact}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPage((p) => p + 1)}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <ArtifactDetailModal
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
        isSaved={selectedArtifact ? isSaved(selectedArtifact.id) : false}
        onSave={saveArtifact}
        onUnsave={unsaveArtifact}
        onCopyToProject={(a) => {
          setSelectedArtifact(null);
          setCopyArtifact(a);
        }}
        isFollowing={selectedArtifact ? isFollowing(selectedArtifact.user_id) : false}
        onFollow={follow}
        onUnfollow={unfollow}
      />

      {/* Modals */}
      <PublishArtifactModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onPublish={publishArtifact}
      />
      <CopyToProjectModal
        open={!!copyArtifact}
        onOpenChange={(open) => !open && setCopyArtifact(null)}
        artifact={copyArtifact}
      />
      <FloatingActionButton onClick={() => setPublishOpen(true)} label="Share" />
    </div>
  );
};

export default CommunityPage;
