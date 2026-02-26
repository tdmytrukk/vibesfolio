import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Copy, Trash2, Check, Search, X, Sparkles, Pencil } from "lucide-react";
import { usePrompts, Prompt } from "@/hooks/usePrompts";
import TagChip from "@/components/TagChip";
import EmptyState from "@/components/EmptyState";
import AddPromptModal from "@/components/AddPromptModal";
import DeletePromptDialog from "@/components/DeletePromptDialog";
import FloatingActionButton from "@/components/FloatingActionButton";

const PromptsPage = () => {
  const { prompts, loading, addPrompt, updatePrompt, deletePrompt, allTags } = usePrompts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null);
  const [editTarget, setEditTarget] = useState<Prompt | null>(null);

  const filtered = prompts.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTags = selectedTags.length === 0 || selectedTags.some((st) => p.tags.includes(st));
    return matchSearch && matchTags;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  const handleCopy = useCallback(async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePrompt(deleteTarget.id);
    setDeleteTarget(null);
  };

  const hasFilters = searchQuery || selectedTags.length > 0;
  const displayTags = allTags.length > 0 ? allTags : ["starter", "debug", "design", "mega"];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h2 className="page-title font-heading text-4xl text-foreground tracking-tight">Prompt Library</h2>
        <p className="text-sm text-muted-foreground/80 mt-4">
          Your go-to prompts, saved and ready.
        </p>
      </motion.div>

      {/* Search & filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search prompts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-studio pl-10 pr-4 py-2.5 placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {displayTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`filter-pill ${isSelected ? 'filter-pill-active' : 'filter-pill-inactive'}`}
                aria-pressed={isSelected}
              >
                {tag}
              </button>
            );
          })}
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

      {/* Prompt list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="studio-card p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        hasFilters ? (
          <EmptyState icon={<Search />} title="No prompts match" subtitle="Try adjusting your search or clearing filters." />
        ) : (
          <EmptyState icon={<Sparkles />} title="Your prompt cards will appear here" subtitle='Tap "+ New prompt" to save your first one—marketing, code, product, design.' />
        )
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filtered.map((prompt, i) => {
              const isExpanded = expandedIds.has(prompt.id);
              const isCopied = copiedId === prompt.id;

              return (
                <motion.div
                  key={prompt.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.4, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  className="studio-card p-5"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium text-foreground text-[15px] leading-snug">{prompt.title}</h3>
                    <span className="date-capsule whitespace-nowrap shrink-0">
                      {formatDate(prompt.created_at)}
                    </span>
                  </div>

                  {/* Tags */}
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {prompt.tags.map((tag, ti) => (
                        <button key={tag} onClick={() => toggleTag(tag)} className="cursor-pointer">
                          <TagChip label={tag} colorIndex={ti} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative">
                    <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${!isExpanded ? "line-clamp-3" : ""}`}>
                      {prompt.content}
                    </p>
                    {!isExpanded && prompt.content.length > 180 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                    <button
                      onClick={() => toggleExpand(prompt.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Expand</>}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditTarget(prompt)}
                        className="flex items-center gap-1 rounded-pill px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleCopy(prompt)}
                        className={`relative flex items-center gap-1 rounded-pill px-3 py-1.5 text-xs font-medium transition-all duration-300 border ${
                          isCopied
                            ? "bg-status-shipped text-foreground border-transparent"
                            : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-primary"
                        }`}
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(prompt)}
                        className="flex items-center rounded-pill px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AddPromptModal
        open={addModalOpen || !!editTarget}
        onClose={() => { setAddModalOpen(false); setEditTarget(null); }}
        onSave={async (prompt) => {
          if (editTarget) await updatePrompt(editTarget.id, prompt);
          else await addPrompt(prompt);
        }}
        existingTags={allTags}
        editingPrompt={editTarget}
      />
      <DeletePromptDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      <FloatingActionButton onClick={() => setAddModalOpen(true)} label="New prompt" />
    </div>
  );
};

export default PromptsPage;
