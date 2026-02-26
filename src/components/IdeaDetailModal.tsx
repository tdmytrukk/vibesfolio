import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, ExternalLink, Mic, MicOff } from "lucide-react";
import TagChip from "@/components/TagChip";
import type { Idea } from "@/hooks/useIdeas";

interface IdeaDetailModalProps {
  idea: Idea | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title: string; note: string | null; tags: string[]; links: string[] }) => void;
  onDelete: (id: string) => void;
}

const IdeaDetailModal = ({ idea, open, onClose, onSave, onDelete }: IdeaDetailModalProps) => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setNote(idea.note || "");
      setTags([...idea.tags]);
      setLinks([...idea.links]);
    }
  }, [idea]);

  const handleSave = () => {
    if (!idea || !title.trim()) return;
    onSave(idea.id, { title: title.trim(), note: note.trim() || null, tags, links });
    onClose();
  };

  const handleDelete = () => {
    if (!idea) return;
    onDelete(idea.id);
    onClose();
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const addLink = () => {
    const l = linkInput.trim();
    if (l) {
      setLinks((prev) => [...prev, l]);
    }
    setLinkInput("");
  };

  const removeLink = (index: number) => setLinks((prev) => prev.filter((_, i) => i !== index));

  const toggleVoice = () => {
    if (isRecording && recognition) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Voice dictation is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    let finalTranscript = note;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += " " + event.results[i][0].transcript;
          setNote(finalTranscript.trim());
        } else {
          interim += event.results[i][0].transcript;
        }
      }
    };

    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    rec.start();
    setRecognition(rec);
    setIsRecording(true);
  };

  if (!idea) return null;

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
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl text-foreground">Edit Idea</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="rounded-full p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete idea"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Idea title"
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 mb-3"
            />

            {/* Note with voice */}
            <div className="relative mb-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Notes..."
                rows={4}
                className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
              />
              <button
                onClick={toggleVoice}
                className={`absolute right-3 top-3 rounded-full p-1.5 transition-colors ${
                  isRecording
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
                aria-label={isRecording ? "Stop recording" : "Start voice dictation"}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, i) => (
                  <button key={tag} onClick={() => removeTag(tag)} className="group">
                    <TagChip label={tag} colorIndex={i} />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag"
                  className="flex-1 rounded-lg bg-secondary/60 border-0 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <button onClick={addTag} className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Inspiration Links</label>
              <div className="space-y-2 mb-2">
                {links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
                    <ExternalLink size={14} className="text-muted-foreground shrink-0" />
                    <a
                      href={link.startsWith("http") ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-foreground hover:underline truncate flex-1"
                    >
                      {link}
                    </a>
                    <button onClick={() => removeLink(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                  placeholder="https://..."
                  className="flex-1 rounded-lg bg-secondary/60 border-0 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <button onClick={addLink} className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full rounded-pill bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Save Changes
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IdeaDetailModal;
