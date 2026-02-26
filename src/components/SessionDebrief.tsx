import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, MessageSquare, CheckCircle2 } from "lucide-react";
import { useDebriefs, DebriefMood } from "@/hooks/useDebriefs";
import { toast } from "sonner";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";

const moodEmoji: Record<DebriefMood, string> = {
  great: "🔥",
  good: "👍",
  meh: "😐",
  rough: "😓",
};

function computeStreak(debriefs: { created_at: string }[]): number {
  if (debriefs.length === 0) return 0;
  const sorted = [...debriefs]
    .map((d) => startOfDay(new Date(d.created_at)).getTime())
    .sort((a, b) => b - a);
  const unique = [...new Set(sorted)];
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const diff = differenceInCalendarDays(new Date(unique[i - 1]), new Date(unique[i]));
    if (diff === 1) streak++;
    else break;
  }
  const daysSinceLast = differenceInCalendarDays(new Date(), new Date(unique[0]));
  if (daysSinceLast > 1) return 0;
  return streak;
}

const SessionDebrief = ({ buildId, onDebriefSaved }: { buildId: string; onDebriefSaved?: (streak: number) => void }) => {
  const { debriefs, loading, addDebrief, deleteDebrief } = useDebriefs(buildId);
  const [adding, setAdding] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [savedStreak, setSavedStreak] = useState(0);
  const [draft, setDraft] = useState({
    what_shipped: "",
    what_learned: "",
    blockers: "",
    next_session_plan: "",
    mood: "" as DebriefMood | "",
  });

  const handleAdd = async () => {
    if (!draft.what_shipped.trim() && !draft.what_learned.trim()) {
      toast.error("Fill in at least one field");
      return;
    }
    const result = await addDebrief({
      what_shipped: draft.what_shipped.trim() || undefined,
      what_learned: draft.what_learned.trim() || undefined,
      blockers: draft.blockers.trim() || undefined,
      next_session_plan: draft.next_session_plan.trim() || undefined,
      mood: draft.mood || undefined,
    });
    if (result) {
      setDraft({ what_shipped: "", what_learned: "", blockers: "", next_session_plan: "", mood: "" });
      setAdding(false);

      // Completion ritual
      const streak = computeStreak([...debriefs, result]);
      setSavedStreak(streak);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 4000);

      onDebriefSaved?.(streak);
      toast.success("Session logged");
    } else {
      toast.error("Couldn't save debrief");
    }
  };

  const inputClass = "w-full rounded-lg bg-background/60 border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare size={15} className="text-muted-foreground" />
          Session Debrief
          {debriefs.length > 0 && (
            <span className="text-[10px] text-muted-foreground/50 ml-1">{debriefs.length}</span>
          )}
        </h3>
        <button
          onClick={() => setAdding(!adding)}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Completion ritual */}
      <AnimatePresence>
        {justSaved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-lg bg-builder-accent/5 border border-builder-accent/10 p-4 text-center"
          >
            <CheckCircle2 size={20} className="text-builder-accent mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Session logged. Streak: {savedStreak} day{savedStreak !== 1 ? "s" : ""}.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Consistency compounds.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-secondary/40 p-3 space-y-2.5">
              {/* Mood picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground mr-1">Mood:</span>
                {(Object.entries(moodEmoji) as [DebriefMood, string][]).map(([mood, emoji]) => (
                  <button
                    key={mood}
                    onClick={() => setDraft((d) => ({ ...d, mood: d.mood === mood ? "" : mood }))}
                    className={`rounded-full w-8 h-8 text-sm transition-all ${
                      draft.mood === mood ? "bg-secondary ring-2 ring-builder-accent/30 scale-110" : "hover:bg-secondary/60"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">What did you ship?</label>
                <textarea placeholder="Features, fixes, progress…" value={draft.what_shipped} onChange={(e) => setDraft((d) => ({ ...d, what_shipped: e.target.value }))} rows={2} className={inputClass} autoFocus />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">What did you learn?</label>
                <textarea placeholder="Insights, discoveries, patterns…" value={draft.what_learned} onChange={(e) => setDraft((d) => ({ ...d, what_learned: e.target.value }))} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Blockers?</label>
                <textarea placeholder="What slowed you down?" value={draft.blockers} onChange={(e) => setDraft((d) => ({ ...d, blockers: e.target.value }))} rows={1} className={inputClass} />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Plan for next session</label>
                <textarea placeholder="What will you tackle next?" value={draft.next_session_plan} onChange={(e) => setDraft((d) => ({ ...d, next_session_plan: e.target.value }))} rows={1} className={inputClass} />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleAdd} className="rounded-full px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90">Save debrief</button>
                <button onClick={() => setAdding(false)} className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-muted/50 rounded-lg" />)}
        </div>
      ) : debriefs.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 text-center py-6">No debriefs yet. Wrap up a session!</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {debriefs.map((d) => (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="group rounded-lg bg-secondary/30 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {d.mood && <span className="text-sm">{moodEmoji[d.mood]}</span>}
                      <span className="text-[10px] text-muted-foreground/40">{format(new Date(d.created_at), "MMM d, h:mm a")}</span>
                    </div>
                    {d.what_shipped && (
                      <div><span className="text-[10px] text-muted-foreground">Shipped:</span> <span className="text-xs text-foreground">{d.what_shipped}</span></div>
                    )}
                    {d.what_learned && (
                      <div><span className="text-[10px] text-muted-foreground">Learned:</span> <span className="text-xs text-foreground">{d.what_learned}</span></div>
                    )}
                    {d.blockers && (
                      <div><span className="text-[10px] text-muted-foreground">Blockers:</span> <span className="text-xs text-foreground">{d.blockers}</span></div>
                    )}
                    {d.next_session_plan && (
                      <div><span className="text-[10px] text-muted-foreground">Next:</span> <span className="text-xs text-foreground">{d.next_session_plan}</span></div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteDebrief(d.id)}
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

export default SessionDebrief;
