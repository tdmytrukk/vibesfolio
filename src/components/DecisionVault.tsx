import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GitBranch } from "lucide-react";
import { useDecisions } from "@/hooks/useDecisions";
import { toast } from "sonner";
import { format } from "date-fns";

const DecisionVault = ({ buildId }: { buildId: string }) => {
  const { decisions, loading, addDecision, deleteDecision } = useDecisions(buildId);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", context: "", outcome: "" });

  const handleAdd = async () => {
    if (!draft.title.trim()) return;
    const result = await addDecision({
      title: draft.title.trim(),
      context: draft.context.trim() || undefined,
      outcome: draft.outcome.trim() || undefined,
    });
    if (result) {
      setDraft({ title: "", context: "", outcome: "" });
      setAdding(false);
      toast.success("Decision recorded");
    } else {
      toast.error("Couldn't save decision");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <GitBranch size={15} className="text-muted-foreground" />
          Decision Vault
        </h3>
        <button
          onClick={() => setAdding(!adding)}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-secondary/40 p-3 space-y-2.5">
              <input
                type="text"
                placeholder="What did you decide?"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="w-full rounded-lg bg-background/60 border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20"
                autoFocus
              />
              <textarea
                placeholder="Why? What were the alternatives?"
                value={draft.context}
                onChange={(e) => setDraft((d) => ({ ...d, context: e.target.value }))}
                rows={2}
                className="w-full rounded-lg bg-background/60 border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
              />
              <textarea
                placeholder="Expected outcome"
                value={draft.outcome}
                onChange={(e) => setDraft((d) => ({ ...d, outcome: e.target.value }))}
                rows={1}
                className="w-full rounded-lg bg-background/60 border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!draft.title.trim()}
                  className="rounded-full px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
                >
                  Record
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-16 bg-muted/50 rounded-lg" />)}
        </div>
      ) : decisions.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 text-center py-6">No decisions recorded yet.</p>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {decisions.map((d) => (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="group rounded-lg bg-secondary/30 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">{d.title}</p>
                    {d.context && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.context}</p>}
                    {d.outcome && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">→ {d.outcome}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/40 mt-1.5">{format(new Date(d.created_at), "MMM d, h:mm a")}</p>
                  </div>
                  <button
                    onClick={() => deleteDecision(d.id)}
                    className="hidden group-hover:block shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DecisionVault;
