import { motion } from "framer-motion";
import { Flame, BarChart3, Trophy, Zap } from "lucide-react";
import type { ProjectTask } from "@/hooks/useTasks";
import type { ShipEntry } from "@/hooks/useShippingLog";
import type { Decision } from "@/hooks/useDecisions";
import type { Debrief } from "@/hooks/useDebriefs";
import { isThisWeek, differenceInCalendarDays, startOfDay } from "date-fns";

interface BuilderMomentumProps {
  tasks: ProjectTask[];
  shipEntries: ShipEntry[];
  decisions: Decision[];
  debriefs: Debrief[];
}

function computeStreak(debriefs: Debrief[]): number {
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
  // Check if most recent day is today or yesterday
  const daysSinceLast = differenceInCalendarDays(new Date(), new Date(unique[0]));
  if (daysSinceLast > 1) return 0;
  return streak;
}

const BuilderMomentum = ({ tasks, shipEntries, decisions, debriefs }: BuilderMomentumProps) => {
  const streak = computeStreak(debriefs);
  const weekSessions = debriefs.filter((d) => isThisWeek(new Date(d.created_at), { weekStartsOn: 1 })).length;
  const weekCompleted = tasks.filter((t) => t.is_done && isThisWeek(new Date(t.updated_at), { weekStartsOn: 1 })).length;
  const weekDecisions = decisions.filter((d) => isThisWeek(new Date(d.created_at), { weekStartsOn: 1 })).length;

  // Recent wins from ship log (last 5)
  const recentWins = shipEntries.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.12 }}
      className="card-momentum p-5"
    >
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
        <Zap size={14} className="text-builder-accent" /> Builder Momentum
      </h3>

      {/* Streak */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Flame size={13} className="text-builder-accent" />
          <span className="text-sm font-medium text-foreground">
            {streak > 0 ? `${streak} Day Shipping Streak` : "Start your streak today"}
          </span>
        </div>
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-builder-accent"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(streak * 14.3, 100)}%` }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        </div>
      </div>

      {/* This Week */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={13} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Week</span>
        </div>
        <div className="space-y-1 text-xs text-foreground">
          <p>• {weekSessions} Session{weekSessions !== 1 ? "s" : ""} Logged</p>
          <p>• {weekCompleted} Task{weekCompleted !== 1 ? "s" : ""} Completed</p>
          <p>• {weekDecisions} Decision{weekDecisions !== 1 ? "s" : ""} Recorded</p>
        </div>
      </div>

      {/* Recent Wins */}
      {recentWins.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={13} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Wins</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentWins.map((w) => (
              <span
                key={w.id}
                className="inline-block rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] text-foreground"
              >
                {w.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BuilderMomentum;
