import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useBuilds } from "@/hooks/useBuilds";
import { usePrompts } from "@/hooks/usePrompts";
import { useResources } from "@/hooks/useResources";
import { toast } from "@/hooks/use-toast";
import type { PublicArtifact } from "@/hooks/usePublicArtifacts";

interface CopyToProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifact: PublicArtifact | null;
}

const CopyToProjectModal = ({ open, onOpenChange, artifact }: CopyToProjectModalProps) => {
  const [target, setTarget] = useState<"library" | "project">("library");
  const [selectedBuildId, setSelectedBuildId] = useState("");
  const [copying, setCopying] = useState(false);
  const { builds } = useBuilds();
  const { addPrompt } = usePrompts();
  const { addResource } = useResources();

  if (!artifact) return null;

  const handleCopy = async () => {
    setCopying(true);

    if (artifact.artifact_type === "prompt") {
      const content = artifact.prompt_content || "";
      const result = await addPrompt({
        title: artifact.title,
        content,
        tags: [...artifact.tags, `via:${artifact.creator_name || "community"}`],
        sections: [{ name: artifact.title, content, position: 1 }],
      });
      if (result) {
        toast({ title: "Copied to your Prompts library." });
      }
    } else {
      const result = await addResource({
        title: artifact.title,
        url: artifact.resource_url || "",
        category: (artifact.resource_category as any) || "other",
        description: artifact.resource_note || artifact.description || undefined,
        tags: [...artifact.tags, `via:${artifact.creator_name || "community"}`],
      });
      if (result) {
        toast({ title: "Copied to your Resources library." });
      }
    }

    setCopying(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">Copy to your library</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-sm font-medium truncate">{artifact.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Originally shared by {artifact.creator_name || "Builder"}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            A private, editable copy will be added to your{" "}
            {artifact.artifact_type === "prompt" ? "Prompts" : "Resources"} library.
          </p>

          <Button onClick={handleCopy} disabled={copying} className="w-full">
            {copying ? "Copying..." : "Copy to Library"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CopyToProjectModal;
