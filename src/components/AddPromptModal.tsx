import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SectionInput {
  name: string;
  content: string;
}

interface AddPromptModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (prompt: {
    title: string;
    content: string;
    tags: string[];
    sections: { name: string; content: string; position: number }[];
  }) => void;
  existingTags: string[];
  editingPrompt?: {
    title: string;
    content: string;
    tags: string[];
    sections?: { name: string; content: string; position: number }[];
  } | null;
}

const defaultSuggestions = ["starter", "debug", "design", "mega"];

const AddPromptModal = ({ open, onClose, onSave, existingTags, editingPrompt }: AddPromptModalProps) => {
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<SectionInput[]>([{ name: "", content: "" }]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const isEdit = !!editingPrompt;

  useEffect(() => {
    if (open) {
      setTitle(editingPrompt?.title || "");
      setTagInput("");
      setTags(editingPrompt?.tags || []);

      if (editingPrompt?.sections && editingPrompt.sections.length > 0) {
        setSections(
          editingPrompt.sections
            .sort((a, b) => a.position - b.position)
            .map((s) => ({ name: s.name, content: s.content }))
        );
      } else if (editingPrompt?.content) {
        setSections([{ name: editingPrompt.title || "", content: editingPrompt.content }]);
      } else {
        setSections([{ name: "", content: "" }]);
      }
    }
  }, [open, editingPrompt]);

  const allContent = sections.map((s) => s.content).join("\n\n");

  const autoGenerateTags = async () => {
    if (!allContent.trim()) {
      toast.error("Add some content first to generate tags");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-tags", {
        body: { title: title.trim(), content: allContent.trim() },
      });
      if (error) throw error;
      const newTags = (data?.tags || []) as string[];
      setTags((prev) => Array.from(new Set([...prev, ...newTags])));
      if (newTags.length > 0) toast.success(`Added ${newTags.length} tags`);
    } catch {
      toast.error("Couldn't generate tags, try again");
    } finally {
      setGenerating(false);
    }
  };

  const suggestions = Array.from(new Set([...defaultSuggestions, ...existingTags]))
    .filter((t) => !tags.includes(t))
    .filter((t) => !tagInput || t.toLowerCase().includes(tagInput.toLowerCase()))
    .slice(0, 6);

  const addTag = (tag: string) => {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const updateSection = (index: number, field: keyof SectionInput, value: string) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addSection = () => {
    setSections((prev) => [...prev, { name: "", content: "" }]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const hasContent = sections.some((s) => s.content.trim());

  const handleSubmit = () => {
    if (!title.trim() || !hasContent) return;
    const numbered = sections.map((s, i) => ({
      name: s.name.trim() || `Section ${i + 1}`,
      content: s.content.trim(),
      position: i + 1,
    })).filter((s) => s.content);

    const concatenated = numbered.map((s) => `## ${s.name}\n${s.content}`).join("\n\n");

    onSave({ title: title.trim(), content: concatenated, tags, sections: numbered });
    if (!isEdit) {
      setTitle("");
      setSections([{ name: "", content: "" }]);
      setTags([]);
      setTagInput("");
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] md:bottom-auto md:top-[6%] z-50 mx-auto max-w-lg card-glass flex flex-col max-h-[calc(100dvh-6rem)] md:max-h-[calc(100dvh-2rem)]"
            role="dialog"
            aria-label={isEdit ? "Edit prompt" : "Add new prompt"}
          >
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-xl text-foreground">{isEdit ? "Edit Prompt" : "New Prompt"}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {/* Title */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
              <input
                type="text"
                placeholder="e.g. Landing page hero copy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-4"
                autoFocus
              />

              {/* Content / Sections */}
              {sections.length === 1 ? (
                <>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Content *</label>
                  <textarea
                    placeholder="Paste or write your prompt here…"
                    value={sections[0].content}
                    onChange={(e) => updateSection(0, "content", e.target.value)}
                    rows={6}
                    className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-4 resize-none leading-relaxed"
                  />
                </>
              ) : (
                <>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Sections *
                  </label>
                  <div className="space-y-3 mb-4">
                    {sections.map((section, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-secondary/30 border border-border/30 p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            placeholder={`Section ${index + 1} name`}
                            value={section.name}
                            onChange={(e) => updateSection(index, "name", e.target.value)}
                            className="flex-1 rounded-md bg-secondary/60 border-0 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20"
                          />
                          <button
                            onClick={() => removeSection(index)}
                            className="rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label={`Remove section ${index + 1}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          placeholder="Paste or write this section's prompt…"
                          value={section.content}
                          onChange={(e) => updateSection(index, "content", e.target.value)}
                          rows={3}
                          className="w-full rounded-md bg-secondary/60 border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1.5 rounded-pill bg-secondary/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-4"
              >
                <Plus size={14} /> Add section
              </button>

              {/* Tags */}
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Tags</label>
                <button
                  type="button"
                  onClick={autoGenerateTags}
                  disabled={generating || !allContent.trim()}
                  className="inline-flex items-center gap-1 rounded-pill bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Auto-tag
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-pill bg-chip-lavender px-3 py-1 text-xs font-medium text-foreground/80"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-foreground" aria-label={`Remove tag ${tag}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type to add tags…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-2"
              />
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => addTag(s)}
                      className="rounded-pill bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 pt-4">
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !hasContent}
                className="w-full rounded-pill bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {isEdit ? "Update Prompt" : "Save Prompt"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPromptModal;
