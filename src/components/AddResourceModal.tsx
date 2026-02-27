import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Upload, FileText, Image, File, Loader2 } from "lucide-react";
import { ResourceCategory } from "@/hooks/useResources";

interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (resource: { title: string; url: string; category: ResourceCategory; description?: string; tags?: string[]; file?: File }) => void;
  onFetchMetadata?: (url: string) => Promise<{ domain: string; ogImage: string | null; ogTitle: string | null; ogDescription: string | null; faviconUrl: string } | null>;
}

const categories: { value: ResourceCategory; label: string; emoji: string }[] = [
  { value: "inspiration", label: "Inspiration", emoji: "✨" },
  { value: "templates", label: "Templates", emoji: "📐" },
  { value: "tools", label: "Tools", emoji: "🛠" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "other", label: "Other", emoji: "📌" },
];

const presetTags = [
  "🎨 Design", "⚛️ React", "📱 Mobile", "🚀 Launch", "💡 Idea",
  "🔧 Dev Tool", "📖 Docs", "🎯 Marketing", "🤖 AI", "💰 Monetization",
];

const emojiOptions = ["🏷️", "🎯", "🔥", "⭐", "💎", "🌈", "🎨", "⚡", "🧩", "📌", "🛡️", "🎵"];

const AddResourceModal = ({ open, onClose, onSave, onFetchMetadata }: AddResourceModalProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("tools");
  const [description, setDescription] = useState("");
  const [urlError, setUrlError] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCustomTag, setShowCustomTag] = useState(false);
  const [customTagName, setCustomTagName] = useState("");
  const [customTagEmoji, setCustomTagEmoji] = useState("🏷️");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [metaFetched, setMetaFetched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFetchedUrl = useRef("");

  const validateUrl = (val: string) => {
    if (!val.trim()) { setUrlError(""); return false; }
    try {
      let test = val.trim();
      if (!test.startsWith("http://") && !test.startsWith("https://")) test = `https://${test}`;
      new URL(test);
      setUrlError("");
      return true;
    } catch { setUrlError("Please enter a valid URL"); return false; }
  };

  const handleUrlBlur = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || !onFetchMetadata || fetchingMeta) return;
    if (!validateUrl(trimmed)) return;
    
    let normalized = trimmed;
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = `https://${normalized}`;
    }
    
    if (normalized === lastFetchedUrl.current) return;
    lastFetchedUrl.current = normalized;

    setFetchingMeta(true);
    try {
      const meta = await onFetchMetadata(normalized);
      if (meta) {
        if (!title.trim() && meta.ogTitle) setTitle(meta.ogTitle);
        if (!description.trim() && meta.ogDescription) setDescription(meta.ogDescription);
        setMetaFetched(true);
      }
    } finally {
      setFetchingMeta(false);
    }
  }, [url, title, description, onFetchMetadata, fetchingMeta]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (!customTagName.trim()) return;
    const tag = `${customTagEmoji} ${customTagName.trim()}`;
    if (!selectedTags.includes(tag)) setSelectedTags((prev) => [...prev, tag]);
    setCustomTagName("");
    setCustomTagEmoji("🏷️");
    setShowCustomTag(false);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image size={14} />;
    if (type.includes("pdf") || type.includes("document")) return <FileText size={14} />;
    return <File size={14} />;
  };

  const resetForm = () => {
    setTitle(""); setUrl(""); setCategory("tools"); setDescription("");
    setUrlError(""); setSelectedTags([]); setShowCustomTag(false); setSelectedFile(null);
    setFetchingMeta(false); setMetaFetched(false);
    lastFetchedUrl.current = "";
  };

  const handleSubmit = () => {
    if (!title.trim() || (!url.trim() && !selectedFile) || urlError) return;
    onSave({
      title: title.trim(),
      url: url.trim() || `file://${selectedFile?.name}`,
      category,
      description: description.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      file: selectedFile || undefined,
    });
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-4 bottom-4 md:bottom-auto md:top-[8%] z-50 mx-auto max-w-lg card-glass flex flex-col max-h-[calc(100dvh-2rem)]"
            role="dialog" aria-label="Add new resource"
          >
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-xl text-foreground">New Resource</h2>
                <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {/* URL */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">URL *</label>
              <div className="relative">
                <input type="url" placeholder="https://tailwindcss.com" value={url}
                  onChange={(e) => { setUrl(e.target.value); validateUrl(e.target.value); setMetaFetched(false); }}
                  onBlur={handleUrlBlur}
                  className={`w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 ${urlError ? "ring-2 ring-destructive/40" : ""}`} />
                {fetchingMeta && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {urlError && <p className="text-xs text-destructive mt-1 mb-3">{urlError}</p>}
              {!urlError && metaFetched && <p className="text-[11px] text-muted-foreground mt-1 mb-3">✨ Title & description auto-filled from page</p>}
              {!urlError && !metaFetched && <div className="mb-4" />}

              {/* Title */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
              <input type="text" placeholder={fetchingMeta ? "Fetching title…" : "e.g. Tailwind CSS Docs"} value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-4" />

              {/* Category */}
              <label className="block text-xs font-medium text-muted-foreground mb-2">Category *</label>
              <div className="flex gap-2 mb-4 flex-wrap">
                {categories.map((cat) => (
                  <button key={cat.value} onClick={() => setCategory(cat.value)}
                    className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
                      category === cat.value ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/80 text-secondary-foreground border-transparent hover:bg-muted"
                    }`}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <label className="block text-xs font-medium text-muted-foreground mb-2">Tags</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {presetTags.map((tag) => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                      selectedTags.includes(tag)
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-secondary/60 text-secondary-foreground border-transparent hover:bg-muted"
                    }`}>
                    {tag}
                  </button>
                ))}
                {selectedTags.filter((t) => !presetTags.includes(t)).map((tag) => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="rounded-pill px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground border border-accent transition-all duration-200">
                    {tag}
                  </button>
                ))}
                <button onClick={() => setShowCustomTag(true)}
                  className="rounded-pill px-3 py-1.5 text-xs font-medium bg-secondary/60 text-muted-foreground border border-dashed border-border hover:bg-muted transition-all duration-200 flex items-center gap-1">
                  <Plus size={12} /> Custom
                </button>
              </div>

              {/* Custom tag creator */}
              <AnimatePresence>
                {showCustomTag && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="flex gap-2 items-end mt-2 p-3 rounded-lg bg-secondary/40">
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-1">Emoji</label>
                        <div className="flex gap-1 flex-wrap max-w-[180px]">
                          {emojiOptions.map((e) => (
                            <button key={e} onClick={() => setCustomTagEmoji(e)}
                              className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all ${
                                customTagEmoji === e ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted"
                              }`}>
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] text-muted-foreground mb-1">Name</label>
                        <input type="text" value={customTagName} onChange={(e) => setCustomTagName(e.target.value)}
                          placeholder="Tag name"
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                          className="w-full rounded-md bg-background/60 border-0 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring/20" />
                      </div>
                      <button onClick={addCustomTag} disabled={!customTagName.trim()}
                        className="rounded-pill bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0">
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File Upload */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Attach File (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-4 py-3 mb-4">
                  {getFileIcon(selectedFile.type)}
                  <span className="text-sm text-foreground truncate flex-1">{selectedFile.name}</span>
                  <span className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"><X size={14} /></button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg bg-secondary/60 border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors mb-4 flex items-center justify-center gap-2">
                  <Upload size={14} /> Choose file…
                </button>
              )}

              {/* Description */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (optional)</label>
              <textarea placeholder="Why you saved this…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-2 resize-none" />
            </div>

            <div className="p-6 pt-4">
              <button onClick={handleSubmit} disabled={!title.trim() || (!url.trim() && !selectedFile) || !!urlError || fetchingMeta}
                className="w-full rounded-pill bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">
                {fetchingMeta ? "Fetching metadata…" : "Save Resource"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddResourceModal;
