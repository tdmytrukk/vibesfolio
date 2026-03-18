import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, Copy, Check, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TagChip from "@/components/TagChip";
import Logo from "@/components/Logo";

interface ArtifactData {
  id: string;
  title: string;
  description: string | null;
  artifact_type: string;
  prompt_content: string | null;
  resource_url: string | null;
  resource_category: string | null;
  tags: string[];
  cover_image_url: string | null;
  recommended_model: string | null;
  resource_note: string | null;
  resource_when_to_use: string | null;
  user_id: string;
}

interface CreatorInfo {
  display_name: string | null;
  avatar_url: string | null;
}

const SharedArtifactPage = () => {
  const { artifactId } = useParams<{ artifactId: string }>();
  const [artifact, setArtifact] = useState<ArtifactData | null>(null);
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchArtifact = async () => {
      if (!artifactId) return;
      const { data, error } = await supabase
        .from("public_artifacts")
        .select("*")
        .eq("id", artifactId)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setArtifact(data as ArtifactData);

      // Fetch creator profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", data.user_id)
        .single();

      if (profile) setCreator(profile);
      setLoading(false);
    };

    fetchArtifact();
  }, [artifactId]);

  const copyPromptText = async () => {
    if (!artifact?.prompt_content) return;
    await navigator.clipboard.writeText(artifact.prompt_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isPrompt = artifact?.artifact_type === "prompt";
  const hasImage = artifact?.cover_image_url && !imgError;

  const resourceDomain = artifact?.resource_url
    ? (() => {
        try {
          return new URL(artifact.resource_url).hostname.replace("www.", "");
        } catch {
          return null;
        }
      })()
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (notFound || !artifact) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="font-heading text-2xl text-foreground">Not found</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          This artifact doesn't exist or is no longer public.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft size={14} /> Go to Vibesfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/30 bg-card/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="small" />
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Sign up free
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Type badge */}
        <div className="flex items-center gap-1.5">
          {isPrompt && <Sparkles size={14} className="text-primary" />}
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {isPrompt ? "Prompt" : "Resource"}
          </span>
        </div>

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
        <h1 className="font-heading text-2xl md:text-3xl text-foreground leading-tight">
          {artifact.title}
        </h1>

        {/* Description */}
        {artifact.description && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {artifact.description}
          </p>
        )}

        {/* Resource URL */}
        {artifact.resource_url && (
          <a
            href={artifact.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary/60 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
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
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="bg-muted/40 rounded-lg p-4 text-sm font-mono text-foreground/90 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap">
              {artifact.prompt_content}
            </pre>
          </div>
        )}

        {/* Additional details */}
        {isPrompt && artifact.recommended_model && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Recommended model:</span> {artifact.recommended_model}
          </p>
        )}
        {!isPrompt && artifact.resource_note && (
          <p className="text-sm text-muted-foreground italic">{artifact.resource_note}</p>
        )}
        {!isPrompt && artifact.resource_when_to_use && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">When to use:</span> {artifact.resource_when_to_use}
          </p>
        )}

        {/* Tags */}
        {artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {artifact.tags.map((tag, i) => (
              <TagChip key={tag} label={tag} colorIndex={i} />
            ))}
          </div>
        )}

        {/* Creator */}
        {creator && (
          <div className="flex items-center gap-3 pt-4 border-t border-border/30">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                {(creator.display_name || "B").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-foreground">
              {creator.display_name || "Builder"}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-xl bg-secondary/50 border border-border/30 p-6 text-center space-y-3">
          <p className="text-sm text-foreground font-medium">
            Discover more prompts and resources from the community
          </p>
          <Link
            to="/auth"
            className="inline-flex rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Join Vibesfolio — it's free
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SharedArtifactPage;
