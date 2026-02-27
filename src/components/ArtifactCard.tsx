import { useState } from "react";
import { Bookmark, BookmarkCheck, Copy, UserPlus, UserCheck, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { PublicArtifact } from "@/hooks/usePublicArtifacts";

interface ArtifactCardProps {
  artifact: PublicArtifact & { is_following?: boolean };
  isSaved: boolean;
  onSave: (id: string) => Promise<boolean>;
  onUnsave: (id: string) => Promise<boolean>;
  onCopyToProject: (artifact: PublicArtifact) => void;
  onFollow: (userId: string) => Promise<boolean>;
  onUnfollow: (userId: string) => Promise<boolean>;
  isFollowing: boolean;
}

const ArtifactCard = ({
  artifact,
  isSaved,
  onSave,
  onUnsave,
  onCopyToProject,
  onFollow,
  onUnfollow,
  isFollowing,
}: ArtifactCardProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const isOwn = user?.id === artifact.user_id;

  const handleSave = async () => {
    setSaving(true);
    if (isSaved) {
      await onUnsave(artifact.id);
      toast({ title: "Removed from library." });
    } else {
      await onSave(artifact.id);
      toast({ title: "Saved to your library." });
    }
    setSaving(false);
  };

  const handleFollow = async () => {
    if (isFollowing) {
      await onUnfollow(artifact.user_id);
    } else {
      await onFollow(artifact.user_id);
    }
  };

  const copyPromptText = () => {
    if (artifact.prompt_content) {
      navigator.clipboard.writeText(artifact.prompt_content);
      toast({ title: "Copied to clipboard." });
    }
  };

  return (
    <div className="group rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 transition-all duration-200 hover:shadow-md hover:border-border">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wider font-medium ${
                artifact.artifact_type === "prompt"
                  ? "border-primary/40 text-primary"
                  : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {artifact.artifact_type}
            </Badge>
            {artifact.recommended_model && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {artifact.recommended_model}
              </span>
            )}
          </div>
          <h3 className="font-heading text-sm font-semibold text-foreground leading-tight truncate">
            {artifact.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      {artifact.description && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {artifact.description}
        </p>
      )}

      {/* Prompt use case */}
      {artifact.prompt_use_case && (
        <p className="text-[11px] text-muted-foreground/80 mb-3 italic">
          Use case: {artifact.prompt_use_case}
        </p>
      )}

      {/* Prompt content preview */}
      {artifact.artifact_type === "prompt" && artifact.prompt_content && (
        <div className="mb-3">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-[11px] text-primary/80 hover:text-primary font-medium mb-1"
          >
            {showPrompt ? "Hide prompt" : "View prompt"}
          </button>
          {showPrompt && (
            <div className="relative group/code">
              <pre className="bg-muted/60 rounded-lg p-3 text-[11px] font-mono text-foreground/90 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {artifact.prompt_content}
              </pre>
              <button
                onClick={copyPromptText}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border border-border/50 opacity-0 group-hover/code:opacity-100 transition-opacity"
                title="Copy prompt"
              >
                <Copy size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resource URL */}
      {artifact.artifact_type === "resource" && artifact.resource_url && (
        <a
          href={artifact.resource_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-primary/80 hover:text-primary mb-3 truncate"
        >
          <ExternalLink size={11} />
          <span className="truncate">{artifact.resource_url}</span>
        </a>
      )}

      {/* Resource note */}
      {artifact.resource_note && (
        <p className="text-[11px] text-muted-foreground/80 mb-3">
          {artifact.resource_note}
        </p>
      )}

      {/* Tags */}
      {artifact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {artifact.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-muted/50 text-[10px] text-muted-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <div className="flex items-center gap-2">
          {artifact.creator_avatar ? (
            <img
              src={artifact.creator_avatar}
              alt=""
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
              {(artifact.creator_name || "B").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[11px] text-muted-foreground">
            {artifact.creator_name || "Builder"}
          </span>
          {!isOwn && (
            <button
              onClick={handleFollow}
              className={`ml-1 p-1 rounded transition-colors ${
                isFollowing
                  ? "text-primary"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
              title={isFollowing ? "Unfollow" : "Follow"}
            >
              {isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
            </button>
          )}
        </div>

        {!isOwn && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1"
              onClick={handleSave}
              disabled={saving}
            >
              {isSaved ? <BookmarkCheck size={13} className="text-primary" /> : <Bookmark size={13} />}
              {isSaved ? "Saved" : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1"
              onClick={() => onCopyToProject(artifact)}
            >
              <Copy size={13} />
              Copy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactCard;
