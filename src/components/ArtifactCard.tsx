import { useState } from "react";
import { Bookmark, BookmarkCheck, Copy, UserPlus, UserCheck, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { PublicArtifact } from "@/hooks/usePublicArtifacts";

const resourceCategoryEmoji: Record<string, string> = {
  inspiration: "✨",
  templates: "📐",
  tools: "🔧",
  learning: "📖",
  other: "📌",
};

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
  const [imgError, setImgError] = useState(false);
  const isOwn = user?.id === artifact.user_id;
  const isPrompt = artifact.artifact_type === "prompt";

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

  // --- PROMPT CARD (compact) ---
  if (isPrompt) {
    return (
      <div className="group card-glass p-4 break-inside-avoid transition-all duration-200 hover:shadow-md">
        {/* Type badge */}
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={12} className="text-primary" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">Prompt</span>
          {artifact.recommended_model && (
            <span className="text-[9px] text-muted-foreground font-mono ml-auto">{artifact.recommended_model}</span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-foreground leading-tight mb-1.5">
          {artifact.title}
        </h3>

        {artifact.description && (
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">
            {artifact.description}
          </p>
        )}

        {/* Prompt preview */}
        {artifact.prompt_content && (
          <div className="mb-2">
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="text-[11px] text-primary/80 hover:text-primary font-medium"
            >
              {showPrompt ? "Hide prompt" : "View prompt"}
            </button>
            {showPrompt && (
              <div className="relative group/code mt-1">
                <pre className="bg-muted/60 rounded-lg p-2.5 text-[10px] font-mono text-foreground/90 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {artifact.prompt_content}
                </pre>
                <button
                  onClick={copyPromptText}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-background/80 border border-border/50 opacity-0 group-hover/code:opacity-100 transition-opacity"
                  title="Copy prompt"
                >
                  <Copy size={11} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {artifact.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full bg-muted/50 text-[9px] text-muted-foreground font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            {artifact.creator_avatar ? (
              <img src={artifact.creator_avatar} alt="" className="w-4 h-4 rounded-full" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium text-muted-foreground">
                {(artifact.creator_name || "B").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[10px] text-muted-foreground">{artifact.creator_name || "Builder"}</span>
            {!isOwn && (
              <button onClick={handleFollow} className={`p-0.5 rounded transition-colors ${isFollowing ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"}`}>
                {isFollowing ? <UserCheck size={10} /> : <UserPlus size={10} />}
              </button>
            )}
          </div>
          {!isOwn && (
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={handleSave} disabled={saving}>
                {isSaved ? <BookmarkCheck size={11} className="text-primary" /> : <Bookmark size={11} />}
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={() => onCopyToProject(artifact)}>
                <Copy size={11} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RESOURCE CARD (rich, with image) ---
  const resourceDomain = artifact.resource_url
    ? (() => { try { return new URL(artifact.resource_url).hostname.replace("www.", ""); } catch { return null; } })()
    : null;

  const faviconUrl = resourceDomain
    ? `https://www.google.com/s2/favicons?domain=${resourceDomain}&sz=64`
    : null;

  return (
    <div className="group card-glass p-0 overflow-hidden break-inside-avoid transition-all duration-200 hover:shadow-md">
      {/* Cover image or fallback */}
      {artifact.resource_url ? (
        <a href={artifact.resource_url} target="_blank" rel="noopener noreferrer" className="block">
          {artifact.cover_image_url && !imgError ? (
            <div className="relative w-full overflow-hidden bg-muted">
              <img
                src={artifact.cover_image_url}
                alt={artifact.title}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                style={{ maxHeight: "220px" }}
                loading="lazy"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 bg-gradient-to-br from-chip-mint to-chip-sky">
              {faviconUrl ? (
                <img src={faviconUrl} alt="" className="w-10 h-10 rounded-lg" />
              ) : (
                <ExternalLink size={28} className="text-foreground/30" />
              )}
              {resourceDomain && (
                <span className="text-xs font-medium text-foreground/40">{resourceDomain}</span>
              )}
            </div>
          )}
        </a>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 bg-gradient-to-br from-chip-peach to-chip-lavender">
          <ExternalLink size={24} className="text-foreground/30" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          {faviconUrl && (
            <img src={faviconUrl} alt="" className="w-3.5 h-3.5 rounded-sm" />
          )}
          <span className="text-[11px] text-muted-foreground truncate">{resourceDomain}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">Resource</span>
          {artifact.resource_category && (
            <span className="text-[11px] text-muted-foreground font-medium capitalize">
              · {resourceCategoryEmoji[artifact.resource_category] || "📌"} {artifact.resource_category}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2">
          {artifact.title}
        </h3>

        {artifact.description && (
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 line-clamp-3">
            {artifact.description}
          </p>
        )}

        {artifact.resource_note && (
          <p className="text-[11px] text-muted-foreground/80 mb-2 italic line-clamp-2">
            {artifact.resource_note}
          </p>
        )}

        {artifact.resource_when_to_use && (
          <p className="text-[10px] text-muted-foreground/70 mb-2">
            <span className="font-medium">When to use:</span> {artifact.resource_when_to_use}
          </p>
        )}

        {/* Tags */}
        {artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artifact.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted/50 text-[10px] text-muted-foreground font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border/30">
          <div className="flex items-center gap-2">
            {artifact.creator_avatar ? (
              <img src={artifact.creator_avatar} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                {(artifact.creator_name || "B").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[11px] text-muted-foreground">{artifact.creator_name || "Builder"}</span>
            {!isOwn && (
              <button onClick={handleFollow} className={`ml-0.5 p-1 rounded transition-colors ${isFollowing ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"}`}>
                {isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
              </button>
            )}
          </div>
          {!isOwn && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1" onClick={handleSave} disabled={saving}>
                {isSaved ? <BookmarkCheck size={13} className="text-primary" /> : <Bookmark size={13} />}
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1" onClick={() => onCopyToProject(artifact)}>
                <Copy size={13} />
                Copy
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtifactCard;
