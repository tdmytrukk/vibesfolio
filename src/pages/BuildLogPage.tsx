import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Rocket } from "lucide-react";
import { useBuilds, Build, BuildStatus } from "@/hooks/useBuilds";
import BuildCard from "@/components/BuildCard";
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
  const { builds, loading, addBuild, updateBuild, deleteBuild } = useBuilds();

  const [statusFilter, setStatusFilter] = useState<BuildStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Build | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Build | null>(null);

  const filtered = builds
    .filter((b) => statusFilter === "all" || b.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "updated")
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortBy === "created")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return a.name.localeCompare(b.name);
    });


  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBuild(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Status counts for filter pills
  const counts = builds.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      acc.all++;
      return acc;
    },
    { all: 0 } as Record<string, number>
  );

  return (
    <div className="max-w-5xl mx-auto">

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
              {counts[s] ? (
                <span className="ml-1.5 opacity-60">{counts[s]}</span>
              ) : null}
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

      {/* Build grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-glass p-5 animate-pulse h-48">
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
            subtitle="Every shipped project starts here. Keep it messy."
            actionLabel="New project"
            onAction={() => setAddModalOpen(true)}
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence initial={false}>
            {filtered.map((build, i) => (
              <BuildCard
                key={build.id}
                build={build}
                index={i}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
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
      <FloatingActionButton onClick={() => setAddModalOpen(true)} label="New project" />
    </div>
  );
};

export default BuildLogPage;
