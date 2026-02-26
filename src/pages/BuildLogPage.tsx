import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Search,
  Rocket,
  ExternalLink,
  Pencil,
  Check,
  Send,
} from "lucide-react";
import { useBuilds, Build, BuildNote, BuildStatus } from "@/hooks/useBuilds";
import EmptyState from "@/components/EmptyState";
import AddBuildModal from "@/components/AddBuildModal";
import DeleteBuildDialog from "@/components/DeleteBuildDialog";
import FloatingActionButton from "@/components/FloatingActionButton";
import { toast } from "sonner";

type SortOption = "updated" | "created" | "name";

const statusLabels: Record<BuildStatus, string> = {
  idea: "Idea",
  "in-progress": "In Progress",
  paused: "Paused",
  shipped: "Shipped",
};

const statusStyles: Record<BuildStatus, string> = {
  idea: "bg-status-idea",
  "in-progress": "bg-status-progress",
  paused: "bg-status-paused",
  shipped: "bg-status-shipped",
};

const allStatuses: (BuildStatus | "all")[] = [
  "all",
  "idea",
  "in-progress",
  "paused",
  "shipped",
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Recently created" },
  { value: "name", label: "Name" },
];

const BuildLogPage = () => {
  const {
    builds,
    loading,
    addBuild,
    updateBuild,
    deleteBuild,
    fetchNotes,
    addNote,
  } = useBuilds();

  const [statusFilter, setStatusFilter] = useState<BuildStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Build | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Build | null>(null);

  // Notes state per build
  const [notesMap, setNotesMap] = useState<Record<string, BuildNote[]>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [loadingNotes, setLoadingNotes] = useState<Set<string>>(new Set());
  const [addingNote, setAddingNote] = useState<Set<string>>(new Set());
  const [noteAdded, setNoteAdded] = useState<string | null>(null);

  // Filter & sort
  const filtered = builds
    .filter((b) => statusFilter === "all" || b.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "updated")
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortBy === "created")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return a.name.localeCompare(b.name);
    });

  const toggleExpand = useCallback(
    async (id: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          // Load notes if not loaded
          if (!notesMap[id]) {
            setLoadingNotes((s) => new Set(s).add(id));
            fetchNotes(id).then((notes) => {
              setNotesMap((m) => ({ ...m, [id]: notes }));
              setLoadingNotes((s) => {
                const next = new Set(s);
                next.delete(id);
                return next;
              });
            });
          }
        }
        return next;
      });
    },
    [notesMap, fetchNotes]
  );

  const handleAddNote = async (buildId: string) => {
    const text = (noteInputs[buildId] || "").trim();
    if (!text) return;

    setAddingNote((s) => new Set(s).add(buildId));
    const note = await addNote(buildId, text);
    setAddingNote((s) => {
      const next = new Set(s);
      next.delete(buildId);
      return next;
    });

    if (note) {
      setNotesMap((m) => ({
        ...m,
        [buildId]: [note, ...(m[buildId] || [])],
      }));
      setNoteInputs((prev) => ({ ...prev, [buildId]: "" }));
      setNoteAdded(buildId);
      setTimeout(() => setNoteAdded(null), 1500);
    } else {
      toast.error("Couldn't add note, try again");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBuild(deleteTarget.id);
    setDeleteTarget(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-end justify-between gap-4 mb-1">
          <h2 className="font-heading text-3xl text-foreground">Build Log</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Shipping is a habit. Log the work.
        </p>
      </motion.div>

      {/* Filters & sort */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/80 text-secondary-foreground border-transparent hover:bg-muted"
              }`}
              aria-pressed={statusFilter === s}
            >
              {s === "all" ? "All" : statusLabels[s]}
            </button>
          ))}

          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg bg-secondary/60 border-0 px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Build list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-glass p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        statusFilter !== "all" ? (
          <EmptyState
            icon={<Search />}
            title={`No ${statusLabels[statusFilter as BuildStatus]} projects`}
            subtitle="Want to create one?"
          />
        ) : (
          <EmptyState
            icon={<Rocket />}
            title="Start with one build"
            subtitle="Keep it messy. Every shipped project starts here."
          />
        )
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((build, i) => {
              const isExpanded = expandedIds.has(build.id);
              const notes = notesMap[build.id] || [];
              const isLoadingNotes = loadingNotes.has(build.id);
              const isAddingNote = addingNote.has(build.id);
              const justAdded = noteAdded === build.id;

              return (
                <motion.div
                  key={build.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="card-glass overflow-hidden"
                >
                  {/* Card header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium text-foreground/80 ${statusStyles[build.status]}`}
                        >
                          {statusLabels[build.status]}
                        </span>
                        <h3 className="font-heading text-lg text-foreground leading-snug">
                          {build.name}
                        </h3>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap pt-1 shrink-0">
                        {formatDate(build.updated_at)}
                      </span>
                    </div>

                    {build.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                        {build.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => toggleExpand(build.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} /> Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> Notes & details
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        {build.lovable_url && (
                          <a
                            href={build.lovable_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-pill px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
                            aria-label="Open Lovable project"
                          >
                            <ExternalLink size={13} /> Open
                          </a>
                        )}
                        <button
                          onClick={() => setEditTarget(build)}
                          className="flex items-center rounded-pill px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                          aria-label="Edit build"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(build)}
                          className="flex items-center rounded-pill px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          aria-label="Delete build"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Notes timeline */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/30 px-5 py-4 space-y-4">
                          {/* Inline note composer */}
                          <div className="flex gap-2">
                            <textarea
                              placeholder="Add a note…"
                              value={noteInputs[build.id] || ""}
                              onChange={(e) =>
                                setNoteInputs((prev) => ({
                                  ...prev,
                                  [build.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  !e.shiftKey &&
                                  (noteInputs[build.id] || "").trim()
                                ) {
                                  e.preventDefault();
                                  handleAddNote(build.id);
                                }
                              }}
                              rows={2}
                              className="flex-1 rounded-lg bg-secondary/60 border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none leading-relaxed"
                            />
                            <button
                              onClick={() => handleAddNote(build.id)}
                              disabled={
                                isAddingNote ||
                                !(noteInputs[build.id] || "").trim()
                              }
                              className={`self-end rounded-pill px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
                                justAdded
                                  ? "bg-status-shipped text-foreground"
                                  : "bg-primary text-primary-foreground hover:opacity-90"
                              } disabled:opacity-40`}
                              aria-label="Add note"
                            >
                              {justAdded ? (
                                <Check size={14} />
                              ) : (
                                <Send size={14} />
                              )}
                            </button>
                          </div>

                          {/* Notes list */}
                          {isLoadingNotes ? (
                            <div className="space-y-2">
                              {[1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="animate-pulse h-10 bg-muted/50 rounded-lg"
                                />
                              ))}
                            </div>
                          ) : notes.length === 0 ? (
                            <p className="text-xs text-muted-foreground/60 text-center py-2">
                              No notes yet. Add one above.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {notes.map((note) => (
                                <div
                                  key={note.id}
                                  className="rounded-lg bg-secondary/40 px-3.5 py-2.5"
                                >
                                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {note.text}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                                    {formatTimestamp(note.created_at)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit build modal */}
      <AddBuildModal
        open={addModalOpen || !!editTarget}
        onClose={() => {
          setAddModalOpen(false);
          setEditTarget(null);
        }}
        onSave={async (build) => {
          if (editTarget) {
            await updateBuild(editTarget.id, build);
          } else {
            await addBuild(build);
          }
        }}
        editingBuild={editTarget}
      />

      {/* Delete confirmation */}
      <DeleteBuildDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <FloatingActionButton onClick={() => setAddModalOpen(true)} label="New build" />
    </div>
  );
};

export default BuildLogPage;
