import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddPromptModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (prompt: { title: string; content: string; tags: string[] }) => void;
  existingTags: string[];
}

const defaultSuggestions = ["starter", "debug", "design", "mega"];

const AddPromptModal = ({ open, onClose, onSave, existingTags }: AddPromptModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const autoGenerateTags = async () => {
    if (!content.trim()) {
      toast.error("Add some content first to generate tags");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-tags", {
        body: { title: title.trim(), content: content.trim() },
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

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), tags });
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg card-glass p-6 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-label="Add new prompt"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl text-foreground">New Prompt</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

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

            {/* Content */}
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Content *</label>
            <textarea
              placeholder="Paste or write your prompt here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-4 resize-none leading-relaxed"
            />

            {/* Tags */}
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Tags</label>
              <button
                type="button"
                onClick={autoGenerateTags}
                disabled={generating || !content.trim()}
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
              <div className="flex flex-wrap gap-1.5 mb-5">
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

            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim()}
              className="w-full rounded-pill bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Save Prompt
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPromptModal;
