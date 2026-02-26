import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Rocket, Wrench, GitBranch, Minus, FlaskConical, ChevronDown } from "lucide-react";
import { useShippingLog, ShipEntryType } from "@/hooks/useShippingLog";
import { toast } from "sonner";
import { format } from "date-fns";

const entryConfig: Record<ShipEntryType, { label: string; icon: React.ReactNode; color: string }> = {
  shipped: { label: "Shipped", icon: <Rocket size={12} />, color: "bg-[hsl(var(--status-shipped))] text-foreground" },
  improved: { label: "Improved", icon: <Wrench size={12} />, color: "bg-[hsl(var(--status-progress))] text-foreground" },
  decided: { label: "Decided", icon: <GitBranch size={12} />, color: "bg-[hsl(var(--chip-lavender))] text-foreground" },
  removed: { label: "Removed", icon: <Minus size={12} />, color: "bg-[hsl(var(--chip-rose))] text-foreground" },
  experimented: { label: "Experimented", icon: <FlaskConical size={12} />, color: "bg-[hsl(var(--chip-peach))] text-foreground" },
};

const ShippingLog = ({ buildId }: { buildId: string }) => {
  const { entries, loading, addEntry, deleteEntry } = useShippingLog(buildId);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ entry_type: "shipped" as ShipEntryType, title: "", description: "" });

  const handleAdd = async () => {
    if (!draft.title.trim()) return;
    const result = await addEntry({
      entry_type: draft.entry_type,
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
    });
    if (result) {
      setDraft({ entry_type: "shipped", title: "", description: "" });
      setAdding(false);
      toast.success("Entry logged");
    } else {
      toast.error("Couldn't add entry");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Rocket size={15} className="text-muted-foreground" />
          Shipping Log
        </h3>
        <button
          onClick={() => setAdding(!adding)}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-secondary/40 p-3 space-y-2.5">
              {/* Type selector */}
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(entryConfig) as ShipEntryType[]).map((type) => {
                  const c = entryConfig[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setDraft((d) => ({ ...d, entry_type: type }))}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                        draft.entry_type === type ? c.color + " ring-2 ring-ring/20" : "bg-secondary/60 text-muted-foreground"
                      }`}
                    >
                      {c.icon} {c.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="What happened?"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="w-full rounded-lg bg-background/60 border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <textarea
                placeholder="Details (optional)"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                rows={2}
                className="w-full rounded-lg bg-background/60 border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!draft.title.trim()}
                  className="rounded-full px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
                >
                  Log it
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

      {/* Timeline */}
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-12 bg-muted/50 rounded-lg" />)}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 text-center py-6">No entries yet. Start shipping!</p>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {entries.map((entry) => {
              const c = entryConfig[entry.entry_type];
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="group flex items-start gap-2.5 rounded-lg bg-secondary/30 px-3 py-2.5"
                >
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 mt-0.5 ${c.color}`}>
                    {c.icon} {c.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{entry.title}</p>
                    {entry.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{entry.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/40 mt-1">{format(new Date(entry.created_at), "MMM d, h:mm a")}</p>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="hidden group-hover:block shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ShippingLog;
