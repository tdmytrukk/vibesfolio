import { useState, useMemo } from "react";
import { Plus, Search, Radio, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtifactCard from "@/components/ArtifactCard";
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
  const [copyArtifact, setCopyArtifact] = useState<PublicArtifact | null>(null);
  const [search, setSearch] = useState("");
  const [feedTab, setFeedTab] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = [...artifacts];

    // Mark own artifacts
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
    <div className="max-w-4xl mx-auto space-y-3 sm:space-y-6">
      {/* Search, Tabs & Builders — single row on mobile */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search artifacts..."
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={feedTab} onValueChange={(v) => { setFeedTab(v); setPage(1); }} className="shrink-0">
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">Recently Added</TabsTrigger>
              <TabsTrigger value="following" className="text-xs">Following</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 shrink-0" onClick={() => navigate("/community/builders")}>
            <Users size={15} />
            <span className="hidden sm:inline">Builders</span>
          </Button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="columns-2 lg:columns-3 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`rounded-xl bg-muted/30 animate-pulse break-inside-avoid ${i % 3 === 0 ? 'h-32' : 'h-48'}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Radio size={40} strokeWidth={1.2} />}
          title={feedTab === "following" ? "No artifacts from people you follow" : "No artifacts yet"}
          subtitle={
            feedTab === "following"
              ? "Follow builders to see their shared prompts and resources here."
              : "Be the first to publish a prompt or resource to the community."
          }
          actionLabel={feedTab === "following" ? "Browse builders" : "Publish artifact"}
          onAction={feedTab === "following" ? () => navigate("/community/builders") : () => setPublishOpen(true)}
        />
      ) : (
        <>
          <div className="columns-2 lg:columns-3 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
            {paginated.map((artifact) => (
              <div key={artifact.id} className="break-inside-avoid">
                <ArtifactCard
                  artifact={artifact}
                  isSaved={isSaved(artifact.id)}
                  onSave={saveArtifact}
                  onUnsave={unsaveArtifact}
                  onCopyToProject={(a) => setCopyArtifact(a)}
                  onFollow={follow}
                  onUnfollow={unfollow}
                  isFollowing={isFollowing(artifact.user_id)}
                />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}


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
      <FloatingActionButton onClick={() => setPublishOpen(true)} label="Publish" />
    </div>
  );
};

export default CommunityPage;
