import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Copy, Trash2, Check, Search, Archive, Layers, Lightbulb, Wrench, BookOpen, Pin } from "lucide-react";
import { useResources, Resource, ResourceCategory } from "@/hooks/useResources";
import TagChip from "@/components/TagChip";
import EmptyState from "@/components/EmptyState";
import AddResourceModal from "@/components/AddResourceModal";
import ResourceDetailModal from "@/components/ResourceDetailModal";
import FloatingActionButton from "@/components/FloatingActionButton";

const categoryConfig: { value: ResourceCategory | "all"; label: string; icon: React.ReactNode; colorIndex: number }[] = [
  { value: "all", label: "All", icon: <Layers size={13} />, colorIndex: 0 },
  { value: "inspiration", label: "Inspiration", icon: <Lightbulb size={13} />, colorIndex: 0 },
  { value: "templates", label: "Templates", icon: <Layers size={13} />, colorIndex: 1 },
  { value: "tools", label: "Tools", icon: <Wrench size={13} />, colorIndex: 2 },
  { value: "learning", label: "Learning", icon: <BookOpen size={13} />, colorIndex: 3 },
  { value: "other", label: "Other", icon: <Pin size={13} />, colorIndex: 4 },
];

const categoryGradients: Record<ResourceCategory, string> = {
  inspiration: "from-chip-lavender to-chip-rose",
  templates: "from-chip-peach to-chip-lavender",
  tools: "from-chip-mint to-chip-sky",
  learning: "from-chip-sky to-chip-lavender",
  other: "from-chip-peach to-chip-mint",
};

const categoryIcons: Record<ResourceCategory, React.ReactNode> = {
  inspiration: <Lightbulb size={28} className="text-foreground/30" />,
  templates: <Layers size={28} className="text-foreground/30" />,
  tools: <Wrench size={28} className="text-foreground/30" />,
  learning: <BookOpen size={28} className="text-foreground/30" />,
  other: <Pin size={28} className="text-foreground/30" />,
};

const VaultPage = () => {
  const { resources, loading, addResource, updateResource, deleteResource } = useResources();
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = resources.filter((r) => {
    const matchCat = selectedCategory === "all" || r.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCopy = useCallback(async (resource: Resource) => {
    await navigator.clipboard.writeText(resource.url);
    setCopiedId(resource.id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const handleDeleteFromDetail = async (id: string) => {
    await deleteResource(id);
  };

  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-end justify-between gap-4 mb-1">
          <h2 className="font-heading text-3xl text-foreground">Resource Vault</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Your vault stays tidy—one link at a time.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryConfig.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-xs font-medium transition-all duration-200 border ${
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/80 text-secondary-foreground border-transparent hover:bg-muted"
              }`}
              aria-pressed={selectedCategory === cat.value}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search resources…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-pill bg-card/80 backdrop-blur-sm border border-border/40 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-glass p-0 overflow-hidden break-inside-avoid animate-pulse">
              <div className="bg-muted" style={{ height: `${140 + (i % 3) * 40}px` }} />
              <div className="p-4">
                <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                <div className="h-2.5 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        searchQuery || selectedCategory !== "all" ? (
          <EmptyState
            icon={<Search />}
            title="No resources match"
            subtitle="Try adjusting your search or category filter."
          />
        ) : (
          <EmptyState
            icon={<Archive />}
            title="Your bookmarks go here"
            subtitle='Tap "+ New resource" to save tools, articles, and inspiration—all in one place.'
          />
        )
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          <AnimatePresence initial={false}>
            {filtered.map((resource, i) => {
              const hasCover = resource.cover_image_url && !imgErrors.has(resource.id);
              const isHovered = hoveredId === resource.id;
              const isCopied = copiedId === resource.id;

              return (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="card-glass p-0 overflow-hidden break-inside-avoid cursor-pointer group relative"
                  onClick={() => setDetailResource(resource)}
                >
                  {/* Cover image or fallback */}
                  {hasCover ? (
                    <div className="relative w-full overflow-hidden bg-muted">
                      <img
                        src={resource.cover_image_url!}
                        alt=""
                        className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        style={{ maxHeight: "220px" }}
                        loading="lazy"
                        onError={() => setImgErrors((prev) => new Set(prev).add(resource.id))}
                      />
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center gap-2 py-10 px-4 bg-gradient-to-br ${categoryGradients[resource.category]}`}>
                      {categoryIcons[resource.category]}
                      <span className="text-xs font-medium text-foreground/40">{resource.domain || "Link"}</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-medium text-foreground text-sm leading-snug mb-1.5 line-clamp-2">
                      {resource.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {resource.favicon_url && (
                        <img src={resource.favicon_url} alt="" className="w-3.5 h-3.5 rounded-sm" />
                      )}
                      <span className="text-[11px] text-muted-foreground truncate">{resource.domain}</span>
                    </div>
                    <TagChip
                      label={resource.category}
                      colorIndex={categoryConfig.findIndex((c) => c.value === resource.category)}
                    />
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {resource.tags.map((tag, ti) => (
                          <TagChip key={ti} label={tag} colorIndex={ti} className="text-[10px] px-2 py-0.5" />
                        ))}
                      </div>
                    )}
                    {resource.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-foreground/5 backdrop-blur-[2px] flex items-end justify-center pb-4 gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => window.open(resource.url, "_blank", "noopener")}
                          className="flex items-center gap-1.5 rounded-pill bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
                          aria-label="Open resource"
                        >
                          <ExternalLink size={13} /> Open
                        </button>
                        <button
                          onClick={() => handleCopy(resource)}
                          className={`flex items-center gap-1 rounded-pill px-3 py-2 text-xs font-medium shadow-md transition-all duration-200 ${
                            isCopied
                              ? "bg-status-shipped text-foreground"
                              : "bg-card text-foreground hover:bg-secondary"
                          }`}
                          aria-label="Copy link"
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          {isCopied ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteFromDetail(resource.id); }}
                          className="flex items-center rounded-pill bg-card px-2.5 py-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-md"
                          aria-label="Delete resource"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ResourceDetailModal
        resource={detailResource}
        onClose={() => setDetailResource(null)}
        onUpdate={updateResource}
        onDelete={handleDeleteFromDetail}
      />
      <AddResourceModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={addResource} />
      <FloatingActionButton onClick={() => setAddModalOpen(true)} label="New resource" />
    </div>
  );
};

export default VaultPage;
