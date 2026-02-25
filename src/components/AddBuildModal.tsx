import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { BuildStatus } from "@/hooks/useBuilds";

interface AddBuildModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (build: {
    name: string;
    description?: string;
    status: BuildStatus;
    lovable_url?: string;
  }) => void;
  editingBuild?: {
    name: string;
    description: string | null;
    status: BuildStatus;
    lovable_url: string | null;
  } | null;
}

const statuses: { value: BuildStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "in-progress", label: "In Progress" },
  { value: "paused", label: "Paused" },
  { value: "shipped", label: "Shipped" },
];

const AddBuildModal = ({ open, onClose, onSave, editingBuild }: AddBuildModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<BuildStatus>("idea");
  const [lovableUrl, setLovableUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const isEdit = !!editingBuild;

  useEffect(() => {
    if (open) {
      setName(editingBuild?.name || "");
      setDescription(editingBuild?.description || "");
      setStatus(editingBuild?.status || "idea");
      setLovableUrl(editingBuild?.lovable_url || "");
      setUrlError("");
    }
  }, [open, editingBuild]);

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const normalizedUrl = lovableUrl.trim();
    if (normalizedUrl && !validateUrl(normalizedUrl)) {
      setUrlError("Please enter a valid URL");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      status,
      lovable_url: normalizedUrl
        ? normalizedUrl.startsWith("http")
          ? normalizedUrl
          : `https://${normalizedUrl}`
        : undefined,
    });

    if (!isEdit) {
      setName("");
      setDescription("");
      setStatus("idea");
      setLovableUrl("");
    }
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
            aria-label={isEdit ? "Edit build" : "Add new build"}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl text-foreground">
                {isEdit ? "Edit Build" : "New Build"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Name */}
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Name *
            </label>
            <input
              type="text"
              placeholder="e.g. LinkFolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-4"
              autoFocus
            />

            {/* Description */}
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Description
            </label>
            <textarea
              placeholder="What are you building?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-4 resize-none leading-relaxed"
            />

            {/* Status */}
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Status
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
                    status === s.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/80 text-secondary-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Lovable URL */}
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Lovable Project URL
            </label>
            <input
              type="text"
              placeholder="https://lovable.dev/projects/..."
              value={lovableUrl}
              onChange={(e) => {
                setLovableUrl(e.target.value);
                setUrlError("");
              }}
              className={`w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 mb-1 ${
                urlError ? "ring-2 ring-destructive/40" : ""
              }`}
            />
            {urlError && (
              <p className="text-xs text-destructive mb-3">{urlError}</p>
            )}
            {!urlError && <div className="mb-4" />}

            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full rounded-pill bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isEdit ? "Update Build" : "Create Build"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddBuildModal;
