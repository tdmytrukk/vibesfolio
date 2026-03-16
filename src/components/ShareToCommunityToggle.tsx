import { useState } from "react";
import { Share2, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ShareToCommunityToggleProps {
  /** Already-shared artifact ID if exists */
  artifactId?: string | null;
  /** Data to publish */
  artifactType: "prompt" | "resource";
  title: string;
  promptContent?: string;
  tags?: string[];
  resourceUrl?: string;
  resourceCategory?: string;
  description?: string;
  coverImageUrl?: string | null;
  /** Callbacks */
  onShared?: (artifactId: string) => void;
  onUnshared?: () => void;
}

const ShareToCommunityToggle = ({
  artifactId,
  artifactType,
  title,
  promptContent,
  tags,
  resourceUrl,
  resourceCategory,
  description,
  onShared,
  onUnshared,
}: ShareToCommunityToggleProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(!!artifactId);
  const [localArtifactId, setLocalArtifactId] = useState(artifactId || null);

  const handleToggle = async () => {
    if (!user) return;
    setLoading(true);

    if (shared && localArtifactId) {
      // Unshare - delete the public artifact
      const { error } = await supabase
        .from("public_artifacts")
        .delete()
        .eq("id", localArtifactId);

      if (!error) {
        setShared(false);
        setLocalArtifactId(null);
        toast({ title: "Removed from community." });
        onUnshared?.();
      }
    } else {
      // Share - create a public artifact
      const insertData: any = {
        user_id: user.id,
        artifact_type: artifactType,
        title,
        tags: tags || [],
        is_public: true,
      };

      if (artifactType === "prompt") {
        insertData.prompt_content = promptContent || null;
      } else {
        insertData.resource_url = resourceUrl || null;
        insertData.resource_category = resourceCategory || null;
        insertData.description = description || null;
      }

      const { data, error } = await supabase
        .from("public_artifacts")
        .insert(insertData)
        .select("id")
        .single();

      if (!error && data) {
        setShared(true);
        setLocalArtifactId(data.id);
        toast({ title: "Shared to community." });
        onShared?.(data.id);
      } else {
        toast({ title: "Failed to share.", variant: "destructive" });
      }
    }

    setLoading(false);
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); handleToggle(); }}
      disabled={loading}
      className={`flex items-center gap-1 rounded-pill px-2.5 py-1.5 text-xs transition-all duration-200 ${
        shared
          ? "text-primary bg-primary/10 hover:bg-primary/15"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
      title={shared ? "Remove from community" : "Share to community"}
      aria-label={shared ? "Remove from community" : "Share to community"}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : shared ? (
        <Check size={13} />
      ) : (
        <Share2 size={13} />
      )}
      {shared ? "Shared" : "Share"}
    </button>
  );
};

export default ShareToCommunityToggle;
