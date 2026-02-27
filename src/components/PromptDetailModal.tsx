import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Trash2, Pencil, Save } from "lucide-react";
import { Prompt } from "@/hooks/usePrompts";
import TagChip from "@/components/TagChip";
import ShareToCommunityToggle from "@/components/ShareToCommunityToggle";

interface Props {
  prompt: Prompt | null;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  sharedArtifactId: string | null;
  onShared?: () => void;
  onUnshared?: () => void;
}

const PromptDetailModal = ({ prompt, onClose, onEdit, onDelete, sharedArtifactId, onShared, onUnshared }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [prompt]);

  const handleEdit = () => {
    if (!prompt) return;
    onEdit(prompt);
    onClose();
  };

  const handleDelete = () => {
    if (!prompt) return;
    onDelete(prompt);
    onClose();
  };

  return (
    <AnimatePresence>
      {prompt && (
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
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-4 top-[8%] z-50 mx-auto max-w-lg card-glass p-0 overflow-hidden max-h-[84vh] flex flex-col"
            role="dialog"
            aria-label="Prompt details"
          >
            <div className="p-5 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-heading text-xl text-foreground leading-snug pr-3">{prompt.title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tags */}
              {prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {prompt.tags.map((tag, i) => (
                    <TagChip key={tag} label={tag} colorIndex={i} />
                  ))}
                </div>
              )}

              {/* Summary */}
              {prompt.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 italic">
                  {prompt.summary}
                </p>
              )}

              {/* Full content */}
              <div className="rounded-lg bg-secondary/40 p-4 mb-4">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Full prompt
                </label>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {prompt.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/30">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 rounded-pill px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                    copied
                      ? "bg-status-shipped text-foreground"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>

                <ShareToCommunityToggle
                  artifactId={sharedArtifactId}
                  artifactType="prompt"
                  title={prompt.title}
                  promptContent={prompt.content}
                  tags={prompt.tags}
                  onShared={() => onShared?.()}
                  onUnshared={() => onUnshared?.()}
                />

                <div className="flex-1" />

                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 rounded-pill bg-secondary text-foreground px-3 py-2.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Pencil size={14} /> Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center rounded-pill bg-secondary text-muted-foreground px-3 py-2.5 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PromptDetailModal;
