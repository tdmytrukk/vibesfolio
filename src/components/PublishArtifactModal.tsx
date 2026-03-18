import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useProfileVisibility } from "@/hooks/useProfileVisibility";
import ProfileVisibilityPrompt from "@/components/ProfileVisibilityPrompt";

interface PublishArtifactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (artifact: any) => Promise<any>;
}

const PublishArtifactModal = ({ open, onOpenChange, onPublish }: PublishArtifactModalProps) => {
  const [type, setType] = useState<"prompt" | "resource">("prompt");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Prompt fields
  const [promptContent, setPromptContent] = useState("");
  const [promptUseCase, setPromptUseCase] = useState("");
  const [promptContext, setPromptContext] = useState("");
  const [recommendedModel, setRecommendedModel] = useState("");

  // Resource fields
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceCategory, setResourceCategory] = useState("tools");
  const [resourceNote, setResourceNote] = useState("");
  const [resourceWhenToUse, setResourceWhenToUse] = useState("");

  const {
    showVisibilityPrompt,
    setShowVisibilityPrompt,
    guardPublish,
    handleVisibilityConfirm,
  } = useProfileVisibility();

  const reset = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setIsPublic(false);
    setPromptContent("");
    setPromptUseCase("");
    setPromptContext("");
    setRecommendedModel("");
    setResourceUrl("");
    setResourceCategory("tools");
    setResourceNote("");
    setResourceWhenToUse("");
  };

  const doSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);

    const artifact: any = {
      artifact_type: type,
      title: title.trim(),
      description: description.trim() || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_public: isPublic,
    };

    if (type === "prompt") {
      artifact.prompt_content = promptContent.trim() || null;
      artifact.prompt_use_case = promptUseCase.trim() || null;
      artifact.prompt_context = promptContext.trim() || null;
      artifact.recommended_model = recommendedModel.trim() || null;
    } else {
      artifact.resource_url = resourceUrl.trim() || null;
      artifact.resource_category = resourceCategory;
      artifact.resource_note = resourceNote.trim() || null;
      artifact.resource_when_to_use = resourceWhenToUse.trim() || null;
    }

    const result = await onPublish(artifact);
    setSubmitting(false);

    if (result) {
      toast({ title: isPublic ? "Published to community." : "Saved as draft." });
      reset();
      onOpenChange(false);
    } else {
      toast({ title: "Failed to publish.", variant: "destructive" });
    }
  };

  const handleSubmit = () => {
    if (isPublic) {
      guardPublish(doSubmit);
    } else {
      doSubmit();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Publish Artifact</DialogTitle>
          </DialogHeader>

          <Tabs value={type} onValueChange={(v) => setType(v as "prompt" | "resource")} className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="prompt" className="flex-1">Prompt</TabsTrigger>
              <TabsTrigger value="resource" className="flex-1">Resource</TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="pub-title">Title</Label>
                <Input
                  id="pub-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Clear, descriptive title"
                />
              </div>

              <div>
                <Label htmlFor="pub-desc">Tactical description</Label>
                <Textarea
                  id="pub-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="1-2 lines: what this does and why it matters"
                  rows={2}
                />
              </div>

              <TabsContent value="prompt" className="mt-0 space-y-4">
                <div>
                  <Label>Prompt content</Label>
                  <Textarea
                    value={promptContent}
                    onChange={(e) => setPromptContent(e.target.value)}
                    placeholder="Full prompt text"
                    rows={5}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <Label>Use case</Label>
                  <Input
                    value={promptUseCase}
                    onChange={(e) => setPromptUseCase(e.target.value)}
                    placeholder="When would someone use this?"
                  />
                </div>
                <div>
                  <Label>Context / When to use</Label>
                  <Textarea
                    value={promptContext}
                    onChange={(e) => setPromptContext(e.target.value)}
                    placeholder="Additional context for effective usage"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Recommended model/tool</Label>
                  <Input
                    value={recommendedModel}
                    onChange={(e) => setRecommendedModel(e.target.value)}
                    placeholder="e.g. GPT-5, Claude, Gemini"
                  />
                </div>
              </TabsContent>

              <TabsContent value="resource" className="mt-0 space-y-4">
                <div>
                  <Label>URL</Label>
                  <Input
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={resourceCategory} onValueChange={setResourceCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">Dev</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tactical note</Label>
                  <Textarea
                    value={resourceNote}
                    onChange={(e) => setResourceNote(e.target.value)}
                    placeholder="Why is this useful?"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>When to use</Label>
                  <Input
                    value={resourceWhenToUse}
                    onChange={(e) => setResourceWhenToUse(e.target.value)}
                    placeholder="Specific scenario"
                  />
                </div>
              </TabsContent>

              <div>
                <Label htmlFor="pub-tags">Tags</Label>
                <Input
                  id="pub-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="comma-separated tags"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">Make public</p>
                  <p className="text-[11px] text-muted-foreground">
                    Visible to all community members
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || submitting}
                className="w-full"
              >
                {submitting ? "Publishing..." : isPublic ? "Publish to Community" : "Save as Draft"}
              </Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
      <ProfileVisibilityPrompt
        open={showVisibilityPrompt}
        onOpenChange={setShowVisibilityPrompt}
        onConfirm={handleVisibilityConfirm}
      />
    </>
  );
};

export default PublishArtifactModal;
