import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PublishToggleProps {
  artifactId?: string | null;
  artifactType: "prompt" | "resource";
  title: string;
  promptContent?: string;
  tags?: string[];
  resourceUrl?: string;
  resourceCategory?: string;
  description?: string;
  onPublished?: (artifactId: string) => void;
  onUnpublished?: () => void;
}

const PublishToggle = ({
  artifactId,
  artifactType,
  title,
  promptContent,
  tags,
  resourceUrl,
  resourceCategory,
  description,
  onPublished,
  onUnpublished,
}: PublishToggleProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(!!artifactId);
  const [localArtifactId, setLocalArtifactId] = useState(artifactId || null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handlePublish = async () => {
    if (!user) return;
    setLoading(true);

    const insertData: Record<string, unknown> = {
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
      .insert(insertData as any)
      .select("id")
      .single();

    if (!error && data) {
      setPublished(true);
      setLocalArtifactId(data.id);
      toast({ title: "Published to community 🚀" });
      onPublished?.(data.id);
    } else {
      toast({ title: "Failed to publish.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleUnpublish = async () => {
    if (!localArtifactId) return;
    setLoading(true);
    setPopoverOpen(false);

    const { error } = await supabase
      .from("public_artifacts")
      .delete()
      .eq("id", localArtifactId);

    if (!error) {
      setPublished(false);
      setLocalArtifactId(null);
      toast({ title: "Removed from community." });
      onUnpublished?.();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
        <Loader2 size={13} className="animate-spin" /> {published ? "Unpublishing…" : "Publishing…"}
      </span>
    );
  }

  if (published) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Published — click for options"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-status-shipped animate-ping opacity-40" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-shipped" />
            </span>
            Live
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-44 p-1.5"
          align="start"
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleUnpublish}
            className="w-full text-left rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            Unpublish
          </button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handlePublish();
      }}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      aria-label="Publish to community"
    >
      <Upload size={13} />
      Publish
    </button>
  );
};

export default PublishToggle;
