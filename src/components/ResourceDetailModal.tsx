import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Copy, Check, Trash2, Pencil, Save } from "lucide-react";
import { Resource, ResourceCategory } from "@/hooks/useResources";
import TagChip from "@/components/TagChip";

const categories: { value: ResourceCategory; label: string; emoji: string }[] = [
  { value: "inspiration", label: "Inspiration", emoji: "✨" },
  { value: "templates", label: "Templates", emoji: "📐" },
  { value: "tools", label: "Tools", emoji: "🛠" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "other", label: "Other", emoji: "📌" },
];

const categoryColorIndex: Record<ResourceCategory, number> = {
  inspiration: 0,
  templates: 1,
  tools: 2,
  learning: 3,
  other: 4,
};

interface Props {
  resource: Resource | null;
  onClose: () => void;
  onUpdate: (id: string, updates: { title?: string; category?: ResourceCategory; description?: string | null }) => Promise<any>;
  onDelete: (id: string) => void;
}

const ResourceDetailModal = ({ resource, onClose, onUpdate, onDelete }: Props) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("other");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setCategory(resource.category);
      setDescription(resource.description || "");
      setEditing(false);
    }
  }, [resource]);

  const handleCopy = async () => {
    if (!resource) return;
    await navigator.clipboard.writeText(resource.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    if (!resource || !title.trim()) return;
    setSaving(true);
    await onUpdate(resource.id, {
      title: title.trim(),
      category,
      description: description.trim() || null,
    });
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = () => {
    if (!resource) return;
    onDelete(resource.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {resource && (
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
            aria-label="Resource details"
          >
            {/* Cover image */}
            {resource.cover_image_url && (
              <div className="relative w-full overflow-hidden bg-muted" style={{ maxHeight: "240px" }}>
                <img
                  src={resource.cover_image_url}
                  alt=""
                  className="w-full object-cover"
                  style={{ maxHeight: "240px" }}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {/* Close button */}
              <div className="flex items-start justify-between mb-4">
                {editing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="font-heading text-xl text-foreground bg-secondary/60 rounded-lg px-3 py-2 w-full mr-3 focus:outline-none focus:ring-2 focus:ring-ring/20"
                    autoFocus
                  />
                ) : (
                  <h2 className="font-heading text-xl text-foreground leading-snug pr-3">{resource.title}</h2>
                )}
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Domain */}
              <div className="flex items-center gap-2 mb-3">
                {resource.favicon_url && (
                  <img src={resource.favicon_url} alt="" className="w-4 h-4 rounded-sm" />
                )}
                <span className="text-xs text-muted-foreground">{resource.domain}</span>
              </div>

              {/* Category */}
              {editing ? (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                        category === cat.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/80 text-secondary-foreground border-transparent hover:bg-muted"
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mb-3">
                  <TagChip label={resource.category} colorIndex={categoryColorIndex[resource.category]} />
                </div>
              )}

              {/* Description */}
              {editing ? (
                <>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Why you saved this…"
                    className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-4 resize-none"
                  />
                </>
              ) : (
                resource.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {resource.description}
                  </p>
                )
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/30">
                <button
                  onClick={() => window.open(resource.url, "_blank", "noopener")}
                  className="flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <ExternalLink size={14} /> Open
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 rounded-pill px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                    copied
                      ? "bg-status-shipped text-foreground"
                      : "bg-secondary text-foreground hover:bg-muted"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>

                <div className="flex-1" />

                {editing ? (
                  <button
                    onClick={handleSave}
                    disabled={!title.trim() || saving}
                    className="flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Save size={14} /> {saving ? "Saving…" : "Save"}
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 rounded-pill bg-secondary text-foreground px-3 py-2.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}

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

export default ResourceDetailModal;
