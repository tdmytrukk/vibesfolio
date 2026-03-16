import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Search, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePrompts, Prompt } from "@/hooks/usePrompts";
import { usePublicArtifacts } from "@/hooks/usePublicArtifacts";
import TagChip from "@/components/TagChip";
import EmptyState from "@/components/EmptyState";
import AddPromptModal from "@/components/AddPromptModal";
import DeletePromptDialog from "@/components/DeletePromptDialog";
import FloatingActionButton from "@/components/FloatingActionButton";
import PromptDetailModal from "@/components/PromptDetailModal";

const PromptsPage = () => {
  const { prompts, loading, addPrompt, updatePrompt, deletePrompt, allTags } = usePrompts();
  const { myArtifacts, refetchMy } = usePublicArtifacts();

  const sharedPromptMap = new Map(
    myArtifacts
      .filter((a) => a.artifact_type === "prompt")
      .map((a) => [a.title, a.id])
  );

  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null);
  const [editTarget, setEditTarget] = useState<Prompt | null>(null);
  const [detailPrompt, setDetailPrompt] = useState<Prompt | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);

  // Filter prompts
  const filtered = prompts.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTags = selectedTags.length === 0 || selectedTags.some((st) => p.tags.includes(st));
    return matchSearch && matchTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  const handleCopy = useCallback(async (e: React.MouseEvent, prompt: Prompt) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deletePrompt(deleteTarget.id);
    if (ok) toast.success("Prompt deleted");
    else toast.error("Failed to delete prompt");
    setDeleteTarget(null);
  };

  const hasFilters = searchQuery || selectedTags.length > 0;

  // Sort tags by frequency (most used first), then limit on mobile
  const sortedTags = useMemo(() => {
    const raw = allTags.length > 0 ? allTags : ["starter", "debug", "design", "mega"];
    const freq = new Map<string, number>();
    prompts.forEach((p) => p.tags.forEach((t) => freq.set(t, (freq.get(t) || 0) + 1)));
    return [...raw].sort((a, b) => (freq.get(b) || 0) - (freq.get(a) || 0));
  }, [allTags, prompts]);

  const displayTags = sortedTags;
  const hasHiddenTags = sortedTags.length > 5;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search & filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search prompts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-pill bg-card/80 backdrop-blur-sm border border-border/40 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {displayTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/80 text-secondary-foreground border-transparent hover:bg-muted"
                }`}
                aria-pressed={isSelected}
              >
                {tag}
              </button>
            );
          })}
          {isMobile && hiddenTagCount > 0 && !showAllTags && (
            <button
              onClick={() => setShowAllTags(true)}
              className="flex items-center gap-0.5 rounded-pill px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 border border-border/30 transition-colors"
            >
              +{hiddenTagCount} <ChevronDown size={12} />
            </button>
          )}
          {isMobile && showAllTags && sortedTags.length > TAG_MOBILE_LIMIT && (
            <button
              onClick={() => setShowAllTags(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Show less
            </button>
          )}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Prompt grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-glass p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={<Search />}
            title="No prompts match"
            subtitle="Try adjusting your search or clearing filters."
          />
        ) : (
          <EmptyState
            icon={<Sparkles />}
            title="Save your first prompt"
            subtitle="Marketing, code, product, design—keep them all here."
            actionLabel="New prompt"
            onAction={() => setAddModalOpen(true)}
          />
        )
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence initial={false}>
            {filtered.map((prompt, i) => {
              const isCopied = copiedId === prompt.id;
              const isShared = sharedPromptMap.has(prompt.title);
              const visibleTags = prompt.tags.slice(0, 3);
              const overflowCount = prompt.tags.length - 3;

              return (
                <motion.div
                  key={prompt.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                  onClick={() => setDetailPrompt(prompt)}
                  className="card-glass p-3.5 cursor-pointer hover:ring-1 hover:ring-ring/15 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Title + shared badge */}
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-2 flex-1">
                      {prompt.title}
                    </h3>
                    {isShared && (
                      <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1" title="Published">
                        <span className="absolute inset-0 rounded-full bg-status-shipped animate-ping opacity-40" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-shipped" />
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {visibleTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {visibleTags.map((tag, ti) => (
                        <TagChip key={tag} label={tag} colorIndex={ti} className="!text-[10px] !px-2 !py-0.5" />
                      ))}
                      {overflowCount > 0 && (
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">
                          +{overflowCount}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Section count + summary/content preview */}
                  {prompt.sections.length > 1 && (
                    <p className="text-[10px] font-medium text-primary/70 mb-0.5">
                      {prompt.sections.length} sections
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                    {prompt.summary || prompt.content}
                  </p>

                  {/* Copy button */}
                  <div className="mt-auto pt-3 border-t border-border/15">
                    <button
                      onClick={(e) => handleCopy(e, prompt)}
                      className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                        isCopied
                          ? "bg-status-shipped text-foreground"
                          : "bg-secondary/80 text-secondary-foreground hover:bg-muted active:scale-[0.96]"
                      }`}
                      aria-label="Copy prompt"
                    >
                      {isCopied ? <Check size={11} /> : <Copy size={11} />}
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Detail modal */}
      <PromptDetailModal
        prompt={detailPrompt}
        onClose={() => setDetailPrompt(null)}
        onEdit={(p) => setEditTarget(p)}
        onDelete={(p) => setDeleteTarget(p)}
        sharedArtifactId={detailPrompt ? sharedPromptMap.get(detailPrompt.title) || null : null}
        onShared={() => refetchMy()}
        onUnshared={() => refetchMy()}
      />

      {/* Add/Edit prompt modal */}
      <AddPromptModal
        open={addModalOpen || !!editTarget}
        onClose={() => { setAddModalOpen(false); setEditTarget(null); }}
        onSave={async (prompt) => {
          if (editTarget) {
            const ok = await updatePrompt(editTarget.id, prompt);
            if (ok) toast.success("Prompt updated");
            else toast.error("Failed to update prompt");
          } else {
            const result = await addPrompt(prompt);
            if (result) toast.success("Prompt saved ✨");
            else toast.error("Failed to save prompt");
          }
        }}
        existingTags={allTags}
        editingPrompt={editTarget ? {
          title: editTarget.title,
          content: editTarget.content,
          tags: editTarget.tags,
          sections: editTarget.sections?.map(s => ({ name: s.name, content: s.content, position: s.position })),
        } : null}
      />

      {/* Delete confirmation */}
      <DeletePromptDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <FloatingActionButton onClick={() => setAddModalOpen(true)} label="New prompt" />
    </div>
  );
};

export default PromptsPage;
