import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Flame,
  CircleDot,
  Snowflake,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import type { ProjectTask, TaskBucket } from "@/hooks/useTasks";

const bucketConfig: Record<TaskBucket, { label: string; icon: React.ReactNode; emoji: string }> = {
  today: { label: "Focus Now", icon: <Flame size={14} />, emoji: "🔥" },
  next: { label: "Queue", icon: <CircleDot size={14} />, emoji: "⏭" },
  backlog: { label: "Parking Lot", icon: <Snowflake size={14} />, emoji: "🧊" },
};

/* ── Sortable Task Item ── */
const SortableTask = ({
  task,
  bucket,
  onToggleDone,
  onMoveBucket,
  onDelete,
}: {
  task: ProjectTask;
  bucket: TaskBucket;
  onToggleDone: (t: ProjectTask) => void;
  onMoveBucket: (t: ProjectTask, b: TaskBucket) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { bucket },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all ${
        task.is_done ? "bg-secondary/20" : "bg-secondary/40"
      }`}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground/60 touch-none">
        <GripVertical size={14} />
      </span>
      <button
        onClick={() => onToggleDone(task)}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          task.is_done
            ? "bg-builder-accent border-builder-accent"
            : "border-muted-foreground/30 hover:border-builder-accent/60"
        }`}
      >
        {task.is_done && <Check size={10} className="text-builder-accent-foreground" />}
      </button>
      <span className={`flex-1 text-sm leading-snug transition-all ${task.is_done ? "line-through text-muted-foreground/40" : "text-foreground"}`}>
        {task.title}
      </span>
      <div className="hidden group-hover:flex items-center gap-0.5">
        {bucket !== "today" && (
          <button onClick={() => onMoveBucket(task, "today")} className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">Focus</button>
        )}
        {bucket !== "next" && (
          <button onClick={() => onMoveBucket(task, "next")} className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">Queue</button>
        )}
        {bucket !== "backlog" && (
          <button onClick={() => onMoveBucket(task, "backlog")} className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">Park</button>
        )}
        <button onClick={() => onDelete(task.id)} className="rounded px-1 py-0.5 text-muted-foreground/50 hover:text-destructive transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
};

/* ── Droppable Bucket ── */
const DroppableBucket = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`min-h-[40px] rounded-lg transition-colors ${isOver ? "bg-builder-accent/5 ring-1 ring-builder-accent/20" : ""}`}>
      {children}
    </div>
  );
};

/* ── Drag overlay item ── */
const DragOverlayItem = ({ task }: { task: ProjectTask }) => (
  <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 shadow-lg ring-2 ring-builder-accent/20">
    <GripVertical size={14} className="text-muted-foreground/50" />
    <span className="text-sm text-foreground">{task.title}</span>
  </div>
);

/* ── Main Board ── */
interface ExecutionBoardProps {
  tasks: ProjectTask[];
  setTasks: React.Dispatch<React.SetStateAction<ProjectTask[]>>;
  byBucket: (b: TaskBucket) => ProjectTask[];
  addTask: (title: string, bucket: TaskBucket) => Promise<ProjectTask | null>;
  updateTask: (id: string, updates: Partial<Pick<ProjectTask, "title" | "bucket" | "is_done" | "position">>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  reorderTasks: (tasks: ProjectTask[]) => Promise<void>;
  loading: boolean;
}

const ExecutionBoard = ({ tasks, setTasks, byBucket, addTask, updateTask, deleteTask, reorderTasks, loading }: ExecutionBoardProps) => {
  const [newTaskInputs, setNewTaskInputs] = useState<Record<TaskBucket, string>>({ today: "", next: "", backlog: "" });
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleAddTask = async (bucket: TaskBucket) => {
    const title = newTaskInputs[bucket]?.trim();
    if (!title) return;
    const result = await addTask(title, bucket);
    if (result) setNewTaskInputs((prev) => ({ ...prev, [bucket]: "" }));
  };

  const handleToggleDone = (task: ProjectTask) => updateTask(task.id, { is_done: !task.is_done });
  const handleMoveBucket = (task: ProjectTask, newBucket: TaskBucket) => updateTask(task.id, { bucket: newBucket, position: 999 });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (!backlogOpen) setBacklogOpen(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;
    let targetBucket: TaskBucket | undefined;
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) targetBucket = overTask.bucket;
    else if (["today", "next", "backlog"].includes(over.id as string)) targetBucket = over.id as TaskBucket;
    if (targetBucket && activeTask.bucket !== targetBucket) {
      setTasks((prev) => prev.map((t) => (t.id === active.id ? { ...t, bucket: targetBucket! } : t)));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;
    const targetBucket = activeTask.bucket;
    const bucketItems = tasks.filter((t) => t.bucket === targetBucket).sort((a, b) => a.position - b.position);
    const oldIndex = bucketItems.findIndex((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);
    let newIndex = overTask ? bucketItems.findIndex((t) => t.id === over.id) : bucketItems.length - 1;
    if (newIndex === -1) newIndex = bucketItems.length - 1;
    if (oldIndex !== newIndex) {
      const reordered = arrayMove(bucketItems, oldIndex, newIndex);
      const updated = tasks.map((t) => {
        if (t.bucket !== targetBucket) return t;
        const idx = reordered.findIndex((r) => r.id === t.id);
        return idx >= 0 ? { ...t, position: idx } : t;
      });
      reorderTasks(updated);
    } else {
      const reindexed = [...tasks];
      for (const b of ["today", "next", "backlog"] as TaskBucket[]) {
        const items = reindexed.filter((t) => t.bucket === b).sort((a2, b2) => a2.position - b2.position);
        items.forEach((t, i) => { t.position = i; });
      }
      reorderTasks(reindexed);
    }
  };

  const renderBucket = (bucket: TaskBucket) => {
    const config = bucketConfig[bucket];
    const items = byBucket(bucket);
    const isBacklog = bucket === "backlog";
    const isCollapsed = isBacklog && !backlogOpen;

    // Progress for Focus Now
    const isFocus = bucket === "today";
    const totalFocus = items.length;
    const doneFocus = items.filter((t) => t.is_done).length;

    return (
      <div key={bucket} className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={isBacklog ? () => setBacklogOpen(!backlogOpen) : undefined}
            className={`flex items-center gap-2 text-sm font-medium text-foreground ${isBacklog ? "cursor-pointer" : "cursor-default"}`}
          >
            <span className="text-muted-foreground">{config.icon}</span>
            {config.label}
            <span className="text-xs text-muted-foreground/60 ml-1">{items.filter((t) => !t.is_done).length}</span>
            {isBacklog && (
              <span className="text-muted-foreground ml-auto">
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </span>
            )}
          </button>
          {isFocus && totalFocus > 0 && (
            <span className="text-[11px] text-muted-foreground/60">{doneFocus} of {totalFocus} done</span>
          )}
        </div>

        {/* Focus Now progress bar */}
        {isFocus && totalFocus > 0 && (
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-builder-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(doneFocus / totalFocus) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        {/* Empty state nudge for Focus Now */}
        {isFocus && items.filter((t) => !t.is_done).length === 0 && totalFocus > 0 && (
          <p className="text-xs text-muted-foreground/50 py-1">All focus tasks done! Pull from Queue.</p>
        )}

        {(!isBacklog || !isCollapsed) && (
          <DroppableBucket id={bucket}>
            <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {items.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    bucket={bucket}
                    onToggleDone={handleToggleDone}
                    onMoveBucket={handleMoveBucket}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </SortableContext>

            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="text"
                placeholder={`Add to ${config.label.toLowerCase()}…`}
                value={newTaskInputs[bucket]}
                onChange={(e) => setNewTaskInputs((prev) => ({ ...prev, [bucket]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTaskInputs[bucket]?.trim()) {
                    e.preventDefault();
                    handleAddTask(bucket);
                  }
                }}
                className="flex-1 rounded-lg bg-secondary/30 border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <button
                onClick={() => handleAddTask(bucket)}
                disabled={!newTaskInputs[bucket]?.trim()}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </DroppableBucket>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted/50 rounded-lg" />)}
      </div>
    );
  }

  return (
    <>
      <h3 className="text-sm font-medium text-foreground mb-4">Execution Board</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {(["today", "next", "backlog"] as TaskBucket[]).map(renderBucket)}
        </div>
        <DragOverlay>
          {activeTask ? <DragOverlayItem task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default ExecutionBoard;
