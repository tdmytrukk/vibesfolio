import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import type { ProjectTask, TaskBucket } from "@/hooks/useTasks";

interface NextActionCardProps {
  tasks: ProjectTask[];
  onStartWorking: () => void;
  onBreakIntoTasks: () => void;
  missionPriority?: string;
}

const NextActionCard = ({ tasks, onStartWorking, onBreakIntoTasks, missionPriority }: NextActionCardProps) => {
  // Find the first undone task from "today", then "next"
  const focusTasks = tasks
    .filter((t) => !t.is_done && t.bucket === "today")
    .sort((a, b) => a.position - b.position);
  const queueTasks = tasks
    .filter((t) => !t.is_done && t.bucket === "next")
    .sort((a, b) => a.position - b.position);

  const nextTask = focusTasks[0] || queueTasks[0];
  const hasAnyTasks = tasks.filter((t) => !t.is_done).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 }}
      className="card-glow p-5"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 block">
        Next Best Action
      </span>

      {nextTask ? (
        <>
          <p className="text-base font-semibold text-foreground leading-snug mb-1">
            {nextTask.title}
          </p>
          {missionPriority && (
            <p className="text-xs text-muted-foreground/60 mb-4">
              Part of: {missionPriority}
            </p>
          )}
        </>
      ) : hasAnyTasks ? (
        <p className="text-sm text-muted-foreground mb-4">
          All focus tasks complete. Pull one from Queue.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          No active tasks. Break down your mission into steps.
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onStartWorking}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium bg-builder-accent text-builder-accent-foreground hover:opacity-90 transition-opacity"
        >
          <Zap size={12} /> Start Working
        </button>
        <button
          onClick={onBreakIntoTasks}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          Break Into Tasks <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
};

export default NextActionCard;
