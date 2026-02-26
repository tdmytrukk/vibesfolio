import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff } from "lucide-react";

interface AddIdeaModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (idea: { title: string; note?: string; tags?: string[]; links?: string[] }) => void;
}

const AddIdeaModal = ({ open, onClose, onAdd }: AddIdeaModalProps) => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), note: note.trim() || undefined });
    setTitle("");
    setNote("");
    onClose();
  };

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
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += " " + event.results[i][0].transcript;
          setNote(finalTranscript.trim());
        }
      }
    };

    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    rec.start();
    setRecognition(rec);
    setIsRecording(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              <h2 className="font-heading text-xl text-foreground">New Idea</h2>
              <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors">
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              placeholder="What's the idea?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-secondary/60 border-0 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 mb-3"
              autoFocus
            />

            <div className="relative mb-5">
              <textarea
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
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

export default AddIdeaModal;
