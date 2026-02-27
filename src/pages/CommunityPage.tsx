import { useState, useMemo } from "react";
import { Plus, Search, Radio, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtifactCard from "@/components/ArtifactCard";
import PublishArtifactModal from "@/components/PublishArtifactModal";
import CopyToProjectModal from "@/components/CopyToProjectModal";
import EmptyState from "@/components/EmptyState";
import { usePublicArtifacts, type PublicArtifact } from "@/hooks/usePublicArtifacts";
import { useSavedArtifacts } from "@/hooks/useSavedArtifacts";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/contexts/AuthContext";

const ITEMS_PER_PAGE = 12;

const CommunityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { artifacts, myArtifacts, loading, publishArtifact } = usePublicArtifacts();
  const { isSaved, saveArtifact, unsaveArtifact } = useSavedArtifacts();
  const { isFollowing, follow, unfollow, followingIds } = useFollows();

  const [publishOpen, setPublishOpen] = useState(false);
  const [copyArtifact, setCopyArtifact] = useState<PublicArtifact | null>(null);
  const [search, setSearch] = useState("");
  const [feedTab, setFeedTab] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = artifacts.filter((a) => a.user_id !== user?.id);

    if (feedTab === "following") {
      items = items.filter((a) => followingIds.has(a.user_id));
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl text-foreground">
            Community
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Field intelligence from builders. Review. Adapt. Execute.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/community/builders")}>
            <Users size={15} />
            Builders
          </Button>
          <Button onClick={() => setPublishOpen(true)} size="sm" className="gap-1.5">
            <Plus size={15} />
            Publish
          </Button>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search artifacts..."
            className="pl-9 h-9"
          />
        </div>
        <Tabs value={feedTab} onValueChange={(v) => { setFeedTab(v); setPage(1); }} className="shrink-0">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">Recently Added</TabsTrigger>
            <TabsTrigger value="following" className="text-xs">Following</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />
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
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                isSaved={isSaved(artifact.id)}
                onSave={saveArtifact}
                onUnsave={unsaveArtifact}
                onCopyToProject={(a) => setCopyArtifact(a)}
                onFollow={follow}
                onUnfollow={unfollow}
                isFollowing={isFollowing(artifact.user_id)}
              />
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

      {/* My Published Artifacts */}
      {myArtifacts.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
            Your Published Artifacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myArtifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                artifact={{ ...artifact, creator_name: "You" }}
                isSaved={false}
                onSave={async () => false}
                onUnsave={async () => false}
                onCopyToProject={() => {}}
                onFollow={async () => false}
                onUnfollow={async () => false}
                isFollowing={false}
              />
            ))}
          </div>
        </div>
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
    </div>
  );
};

export default CommunityPage;
