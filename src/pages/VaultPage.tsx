import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Archive, Layers, Lightbulb, Wrench, BookOpen, Pin, Paperclip, Globe } from "lucide-react";
import { toast } from "sonner";
import { useResources, Resource, ResourceCategory } from "@/hooks/useResources";
import { usePublicArtifacts } from "@/hooks/usePublicArtifacts";
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

const categoryEmoji: Record<ResourceCategory, string> = {
  inspiration: "✨",
  templates: "📐",
  tools: "🔧",
  learning: "📖",
  other: "📌",
};

const VaultPage = () => {
  const { resources, loading, addResource, updateResource, deleteResource, fetchUrlMetadata } = useResources();
  const { myArtifacts } = usePublicArtifacts();
  
  const sharedResourceMap = new Map(
    myArtifacts
      .filter((a) => a.artifact_type === "resource")
      .map((a) => [a.title, a.id])
  );
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);

  const filtered = resources.filter((r) => {
    const matchCat = selectedCategory === "all" || r.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDeleteFromDetail = async (id: string) => {
    const ok = await deleteResource(id);
    if (ok) toast.success("Resource deleted");
    else toast.error("Failed to delete resource");
  };

  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  return (
    <div className="max-w-5xl mx-auto">

      {/* Search bar — full-width rounded pill like Community */}
      <div className="relative mb-4 sm:mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
        <input
          type="text"
          placeholder="Search resources…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-sm rounded-full bg-card/80 backdrop-blur-sm border border-border/20 pl-11 pr-4 h-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
        />
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-4 sm:mb-6">
        {categoryConfig.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-1.5 rounded-full px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium transition-all duration-200 border ${
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground border-primary shadow-none"
                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
            }`}
            aria-pressed={selectedCategory === cat.value}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-glass p-0 overflow-hidden animate-pulse">
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
            subtitle="Save tools, articles, and inspiration—all in one place."
            actionLabel="Save first resource"
            onAction={() => setAddModalOpen(true)}
          />
        )
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence initial={false}>
            {filtered.map((resource, i) => {
              const hasCover = resource.cover_image_url && !imgErrors.has(resource.id);

              return (
                <motion.button
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="group w-full text-left rounded-2xl bg-card/80 backdrop-blur-sm border border-border/20 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col"
                  onClick={() => setDetailResource(resource)}
                >
                  {/* Hero image — aspect-video on mobile, fixed h-40 on desktop */}
                  {hasCover ? (
                    <div className="relative w-full aspect-video sm:aspect-auto sm:h-40 overflow-hidden bg-muted/30 shrink-0">
                      <img
                        src={resource.cover_image_url!}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                        onError={() => setImgErrors((prev) => new Set(prev).add(resource.id))}
                      />
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center gap-2 aspect-video sm:aspect-auto sm:h-40 px-4 bg-gradient-to-br ${categoryGradients[resource.category]}`}>
                      {resource.file_url ? (
                        <Paperclip size={28} className="text-foreground/30" />
                      ) : resource.favicon_url ? (
                        <img src={resource.favicon_url} alt="" className="w-10 h-10 rounded-lg" />
                      ) : (
                        categoryIcons[resource.category]
                      )}
                      <span className="text-xs font-medium text-foreground/40 max-w-[80%] text-center truncate">
                        {resource.domain || "File"}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col gap-1.5 overflow-hidden">
                    <div className="flex items-start gap-1.5">
                      <h3 className="text-[13px] sm:text-sm font-semibold text-foreground leading-snug line-clamp-2 flex-1">
                        {resource.title}
                      </h3>
                      {sharedResourceMap.has(resource.title) && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-medium shrink-0 mt-0.5">
                          <Globe size={9} />
                        </span>
                      )}
                    </div>

                    {/* Description — hidden on mobile */}
                    {resource.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed overflow-hidden">
                        {resource.description}
                      </p>
                    )}

                    {/* Meta row — compact, pushed to bottom */}
                    <div className="flex items-center gap-2 mt-auto pt-1">
                      {resource.favicon_url && (
                        <img src={resource.favicon_url} alt="" className="w-3.5 h-3.5 rounded-sm shrink-0" />
                      )}
                      <span className="text-[11px] text-muted-foreground truncate">
                        {resource.domain || categoryEmoji[resource.category] + " " + resource.category}
                      </span>
                    </div>

                    {/* Tags — limit to 2 on mobile, show all on desktop */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="hidden sm:flex gap-1 flex-wrap mt-1">
                        {resource.tags.map((tag, ti) => (
                          <TagChip key={ti} label={tag} colorIndex={ti} className="text-[10px] px-2 py-0.5" />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.button>
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
      <AddResourceModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={async (resource) => {
        const result = await addResource(resource);
        if (result) toast.success("Resource saved ✨");
        else toast.error("Failed to save resource");
      }} onFetchMetadata={fetchUrlMetadata} />
      <FloatingActionButton onClick={() => setAddModalOpen(true)} label="New resource" />
    </div>
  );
};

export default VaultPage;
