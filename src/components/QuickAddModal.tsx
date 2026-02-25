import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
}

const QuickAddModal = ({ open, onClose }: QuickAddModalProps) => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"idea" | "prompt" | "link" | "log">("idea");

  const types = [
    { key: "idea" as const, label: "💡 Idea" },
    { key: "prompt" as const, label: "✨ Prompt" },
    { key: "link" as const, label: "🔗 Link" },
    { key: "log" as const, label: "🚀 Log" },
  ];

  const handleSubmit = () => {
    // Future: persist to Lovable Cloud
    setTitle("");
    setNote("");
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
            className="fixed inset-x-4 top-[20%] z-50 mx-auto max-w-md card-glass p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl text-foreground">Quick Add</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Type pills */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {types.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`rounded-pill px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    type === t.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 mb-3"
              autoFocus
            />

            <textarea
              placeholder="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 mb-5 resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="w-full rounded-pill bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Capture
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickAddModal;
