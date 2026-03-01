import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Copy,
  UserPlus,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { PublicArtifact } from "@/hooks/usePublicArtifacts";

interface ArtifactDetailModalProps {
  artifact: PublicArtifact | null;
  onClose: () => void;
  isSaved: boolean;
  onSave: (id: string) => Promise<boolean>;
  onUnsave: (id: string) => Promise<boolean>;
  onCopyToProject: (artifact: PublicArtifact) => void;
  isFollowing: boolean;
  onFollow: (userId: string) => Promise<boolean>;
  onUnfollow: (userId: string) => Promise<boolean>;
}

const ArtifactDetailModal = ({
  artifact,
  onClose,
  isSaved,
  onSave,
  onUnsave,
  onCopyToProject,
  isFollowing,
  onFollow,
  onUnfollow,
}: ArtifactDetailModalProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!artifact) return null;

  const isOwn = user?.id === artifact.user_id;
  const isPrompt = artifact.artifact_type === "prompt";

  const resourceDomain = artifact.resource_url
    ? (() => {
        try {
          return new URL(artifact.resource_url).hostname.replace("www.", "");
        } catch {
          return null;
        }
      })()
    : null;

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

  const hasImage = artifact.cover_image_url && !imgError;

  return (
    <AnimatePresence>
      {artifact && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] md:bottom-auto md:top-[5%] z-50 mx-auto max-w-lg card-glass flex flex-col max-h-[calc(100dvh-6rem)] md:max-h-[calc(100dvh-2rem)] overflow-hidden"
            role="dialog"
            aria-label={artifact.title}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-0">
              <div className="flex items-center gap-1.5">
                {isPrompt && <Sparkles size={14} className="text-primary" />}
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {isPrompt ? "Prompt" : "Resource"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Hero image */}
              {hasImage && (
                <div className="rounded-xl overflow-hidden aspect-[16/9] bg-muted/30">
                  <img
                    src={artifact.cover_image_url!}
                    alt={artifact.title}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="font-heading text-xl text-foreground leading-tight">
                {artifact.title}
              </h2>

              {/* Description */}
              {artifact.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {artifact.description}
                </p>
              )}

              {/* Resource URL */}
              {artifact.resource_url && (
                <a
                  href={artifact.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink size={14} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{resourceDomain || artifact.resource_url}</span>
                </a>
              )}

              {/* Prompt content */}
              {isPrompt && artifact.prompt_content && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Prompt content</span>
                    <button
                      onClick={copyPromptText}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <pre className="bg-muted/40 rounded-lg p-3 text-xs font-mono text-foreground/90 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {artifact.prompt_content}
                  </pre>
                </div>
              )}

              {/* Additional prompt details */}
              {isPrompt && artifact.recommended_model && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Recommended model:</span>{" "}
                  {artifact.recommended_model}
                </div>
              )}

              {/* Resource details */}
              {!isPrompt && artifact.resource_note && (
                <div className="text-sm text-muted-foreground italic">
                  {artifact.resource_note}
                </div>
              )}

              {!isPrompt && artifact.resource_when_to_use && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">When to use:</span>{" "}
                  {artifact.resource_when_to_use}
                </div>
              )}

              {/* Tags */}
              {artifact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {artifact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-muted/50 text-[11px] text-muted-foreground font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Creator row */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                {artifact.creator_avatar ? (
                  <img
                    src={artifact.creator_avatar}
                    alt=""
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
                    {(artifact.creator_name || "B").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground font-medium">
                    {artifact.creator_name || "Builder"}
                  </span>
                </div>
                {!isOwn && (
                  <button
                    onClick={handleFollow}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isFollowing
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={12} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} /> Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Action bar */}
            {!isOwn && (
              <div className="flex items-center gap-2 p-4 pt-3 border-t border-border/20">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {isSaved ? (
                    <BookmarkCheck size={14} className="text-primary" />
                  ) : (
                    <Bookmark size={14} />
                  )}
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => onCopyToProject(artifact)}
                >
                  <Copy size={14} />
                  Copy to project
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ArtifactDetailModal;
