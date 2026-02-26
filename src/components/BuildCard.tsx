import { memo } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ExternalLink,
  Pencil,
  Trash2,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Build, BuildStatus } from "@/hooks/useBuilds";

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

function getMomentumLevel(updatedAt: string): { label: string; intensity: number } {
  const diff = Date.now() - new Date(updatedAt).getTime();
  const days = diff / 86400000;
  if (days < 1) return { label: "Hot", intensity: 3 };
  if (days < 3) return { label: "Active", intensity: 2 };
  if (days < 7) return { label: "Warm", intensity: 1 };
  return { label: "Stale", intensity: 0 };
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return "Yesterday";
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const momentumColors = [
  "text-muted-foreground/40",
  "text-amber-500/70",
  "text-green-500/70",
  "text-green-500",
];

interface BuildCardProps {
  build: Build;
  index: number;
  onEdit: (build: Build) => void;
  onDelete: (build: Build) => void;
}

const BuildCard = memo(({ build, index, onEdit, onDelete }: BuildCardProps) => {
  const navigate = useNavigate();
  const momentum = getMomentumLevel(build.updated_at);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="card-glass flex flex-col h-full"
    >
      {/* Header row: status + momentum */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-medium text-foreground/80 ${statusStyles[build.status]}`}
        >
          {statusLabels[build.status]}
        </span>

        <div className="flex items-center gap-1.5" title={`Momentum: ${momentum.label}`}>
          <Activity size={12} className={momentumColors[momentum.intensity]} />
          <span className={`text-[10px] font-medium ${momentumColors[momentum.intensity]}`}>
            {momentum.label}
          </span>
        </div>
      </div>

      {/* Name & description */}
      <div className="px-5 flex-1 min-h-0">
        <h3 className="font-heading text-lg text-foreground leading-snug mb-1 line-clamp-2">
          {build.name}
        </h3>
        {build.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
            {build.description}
          </p>
        )}
      </div>

      {/* Meta: last updated */}
      <div className="px-5 pb-3">
        <p className="text-[11px] text-muted-foreground/60">
          Updated {formatRelative(build.updated_at)}
        </p>
      </div>

      {/* Actions footer */}
      <div className="border-t border-border/30 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {build.lovable_url && (
            <a
              href={build.lovable_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-pill px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Open Lovable project"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={() => onEdit(build)}
            className="flex items-center rounded-pill px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Edit build"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(build)}
            className="flex items-center rounded-pill px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Delete build"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <button
          onClick={() => navigate(`/log/${build.id}`)}
          className="flex items-center gap-1 rounded-pill px-3 py-1.5 text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Open <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
});

BuildCard.displayName = "BuildCard";

export default BuildCard;
