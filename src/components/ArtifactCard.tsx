import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import type { PublicArtifact } from "@/hooks/usePublicArtifacts";

interface ArtifactCardProps {
  artifact: PublicArtifact;
  onClick: (artifact: PublicArtifact) => void;
}

const ArtifactCard = ({ artifact, onClick }: ArtifactCardProps) => {
  const [imgError, setImgError] = useState(false);
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

  const hasImage = artifact.cover_image_url && !imgError;

  return (
    <button
      onClick={() => onClick(artifact)}
      className="group w-full text-left rounded-2xl bg-card/80 backdrop-blur-sm border border-border/20 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col"
      aria-label={`View ${artifact.title}`}
    >
      {/* Hero Image — fixed 16:9, flush to top, no padding */}
      <div className="relative w-full aspect-video overflow-hidden bg-muted/30 shrink-0">
        {hasImage ? (
          <img
            src={artifact.cover_image_url!}
            alt={artifact.title}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40">
            {isPrompt ? (
              <Sparkles size={28} className="text-primary/30" />
            ) : (
              <ExternalLink size={28} className="text-muted-foreground/30" />
            )}
            <span className="text-sm font-medium text-muted-foreground/40 max-w-[80%] text-center truncate">
              {artifact.title}
            </span>
          </div>
        )}

        {/* Subtle type indicator */}
        {isPrompt && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/30">
            <span className="text-[10px] font-semibold text-primary flex items-center gap-1">
              <Sparkles size={10} /> Prompt
            </span>
          </div>
        )}
      </div>

      {/* Content — padding only here */}
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <h3 className="text-[15px] sm:text-base font-semibold text-foreground leading-snug line-clamp-2">
          {artifact.title}
        </h3>

        {artifact.description && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            {artifact.description}
          </p>
        )}

        {/* Meta Row — pushed to bottom */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            {artifact.creator_avatar ? (
              <img
                src={artifact.creator_avatar}
                alt=""
                className="w-5 h-5 rounded-full shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground shrink-0">
                {(artifact.creator_name || "B").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">
              {artifact.creator_name || "Builder"}
            </span>
          </div>

          {resourceDomain && (
            <span className="text-[11px] text-muted-foreground/60 truncate ml-2">
              {resourceDomain}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ArtifactCard;
