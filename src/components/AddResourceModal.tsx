import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ResourceCategory } from "@/hooks/useResources";

interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (resource: { title: string; url: string; category: ResourceCategory; description?: string }) => void;
}

const categories: { value: ResourceCategory; label: string; emoji: string }[] = [
  { value: "inspiration", label: "Inspiration", emoji: "✨" },
  { value: "templates", label: "Templates", emoji: "📐" },
  { value: "tools", label: "Tools", emoji: "🛠" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "other", label: "Other", emoji: "📌" },
];

const AddResourceModal = ({ open, onClose, onSave }: AddResourceModalProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("tools");
  const [description, setDescription] = useState("");
  const [urlError, setUrlError] = useState("");

  const validateUrl = (val: string) => {
    if (!val.trim()) {
      setUrlError("");
      return;
    }
    try {
      let test = val.trim();
      if (!test.startsWith("http://") && !test.startsWith("https://")) test = `https://${test}`;
      new URL(test);
      setUrlError("");
    } catch {
      setUrlError("Please enter a valid URL");
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !url.trim() || urlError) return;
    onSave({ title: title.trim(), url: url.trim(), category, description: description.trim() || undefined });
    setTitle("");
    setUrl("");
    setCategory("tools");
    setDescription("");
    setUrlError("");
    onClose();
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
            aria-label="Add new resource"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl text-foreground">New Resource</h2>
              <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Title */}
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
            <input
              type="text"
              placeholder="e.g. Tailwind CSS Docs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-4"
              autoFocus
            />

            {/* URL */}
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">URL *</label>
            <input
              type="url"
              placeholder="https://tailwindcss.com"
              value={url}
              onChange={(e) => { setUrl(e.target.value); validateUrl(e.target.value); }}
              className={`w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 ${urlError ? "ring-2 ring-destructive/40" : ""}`}
            />
            {urlError && <p className="text-xs text-destructive mt-1 mb-3">{urlError}</p>}
            {!urlError && <div className="mb-4" />}

            {/* Category */}
            <label className="block text-xs font-medium text-muted-foreground mb-2">Category *</label>
            <div className="flex gap-2 mb-4 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
                    category === cat.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/80 text-secondary-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (optional)</label>
            <textarea
              placeholder="Why you saved this…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-5 resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !url.trim() || !!urlError}
              className="w-full rounded-pill bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Save Resource
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddResourceModal;
