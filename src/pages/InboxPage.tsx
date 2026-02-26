import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ExternalLink } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import TagChip from "@/components/TagChip";
import AddIdeaModal from "@/components/AddIdeaModal";
import IdeaDetailModal from "@/components/IdeaDetailModal";
import FloatingActionButton from "@/components/FloatingActionButton";
import { useIdeas, type Idea } from "@/hooks/useIdeas";
import { Skeleton } from "@/components/ui/skeleton";

const InboxPage = () => {
  const { ideas, loading, addIdea, updateIdea, deleteIdea } = useIdeas();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h2 className="page-title font-heading text-4xl text-foreground mb-2 tracking-tight">Ideas</h2>
        <p className="text-sm text-muted-foreground/80 mt-4">
          Capture fast. Organize later.
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-[var(--radius)]" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={<Lightbulb />}
          title="Drop your first spark"
          subtitle="Messy is welcome. Tap New Idea to capture one—title is all you need."
        />
      ) : (
        <div className="space-y-4">
          {ideas.map((idea, i) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelectedIdea(idea)}
              className="studio-card p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-[15px] mb-1">{idea.title}</h3>
                  {idea.note && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {idea.note}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {idea.tags.map((tag, ti) => (
                      <TagChip key={tag} label={tag} colorIndex={ti} />
                    ))}
                    {idea.links.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ExternalLink size={12} />
                        {idea.links.length} link{idea.links.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <span className="date-capsule whitespace-nowrap shrink-0">
                  {formatDate(idea.created_at)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AddIdeaModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addIdea} />
      <IdeaDetailModal
        idea={selectedIdea}
        open={!!selectedIdea}
        onClose={() => setSelectedIdea(null)}
        onSave={(id, updates) => updateIdea(id, updates)}
        onDelete={(id) => deleteIdea(id)}
      />
      <FloatingActionButton onClick={() => setAddOpen(true)} label="New idea" />
    </div>
  );
};

export default InboxPage;
