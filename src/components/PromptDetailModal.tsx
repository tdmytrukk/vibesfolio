import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Pencil } from "lucide-react";
import { Prompt } from "@/hooks/usePrompts";
import TagChip from "@/components/TagChip";
import PublishToggle from "@/components/PublishToggle";
import ShareButton from "@/components/ShareButton";

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
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyAll = useCallback(async () => {
    if (!prompt) return;
    const text = prompt.sections.length > 0
      ? prompt.sections.map((s) => `## ${s.name}\n${s.content}`).join("\n\n")
      : prompt.content;
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }, [prompt]);

  const handleCopySection = useCallback(async (sectionId: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 1500);
  }, []);

  const handleEdit = () => {
    if (!prompt) return;
    onEdit(prompt);
    onClose();
  };

  // Delete is handled via the edit modal flow

  const hasSections = prompt && prompt.sections.length > 0;

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

              {/* Sections */}
              {hasSections ? (
                <div className="space-y-3 mb-4">
                  {prompt.sections
                    .sort((a, b) => a.position - b.position)
                    .map((section) => {
                      const isCopied = copiedSection === section.id;
                      return (
                        <div
                          key={section.id}
                          className="rounded-lg bg-secondary/40 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                                {section.position}
                              </span>
                              <span className="text-sm font-semibold text-foreground">{section.name}</span>
                            </div>
                            <button
                              onClick={() => handleCopySection(section.id, section.content)}
                              className={`flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                                isCopied
                                  ? "bg-status-shipped text-foreground"
                                  : "bg-secondary text-secondary-foreground hover:bg-muted"
                              }`}
                              aria-label={`Copy section ${section.position}`}
                            >
                              {isCopied ? <Check size={11} /> : <Copy size={11} />}
                              {isCopied ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {section.content}
                          </p>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="rounded-lg bg-secondary/40 p-4 mb-4">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                    Full prompt
                  </label>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {prompt.content}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                <button
                  onClick={handleCopyAll}
                  className={`flex items-center justify-center rounded-full p-2 transition-all duration-200 ${
                    copiedAll
                      ? "bg-status-shipped text-foreground"
                      : "bg-secondary text-foreground hover:bg-muted"
                  }`}
                  aria-label={copiedAll ? "Copied" : "Copy"}
                >
                  {copiedAll ? <Check size={15} /> : <Copy size={15} />}
                </button>

                <PublishToggle
                  artifactId={sharedArtifactId}
                  artifactType="prompt"
                  title={prompt.title}
                  promptContent={prompt.content}
                  tags={prompt.tags}
                  onPublished={() => onShared?.()}
                  onUnpublished={() => onUnshared?.()}
                />

                <ShareButton
                  artifactId={sharedArtifactId}
                  title={prompt.title}
                />

                <div className="flex-1" />

                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center rounded-full p-2 bg-secondary text-foreground hover:bg-muted transition-colors"
                  aria-label="Edit"
                >
                  <Pencil size={15} />
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
