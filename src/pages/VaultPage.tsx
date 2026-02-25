import { motion } from "framer-motion";
import { Archive, ExternalLink } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import TagChip from "@/components/TagChip";

const categories = ["All", "Tools", "Articles", "Inspiration", "Tutorials"];

const sampleResources = [
  {
    id: 1,
    title: "shadcn/ui",
    domain: "ui.shadcn.com",
    category: "Tools",
    categoryIndex: 0,
  },
  {
    id: 2,
    title: "Indie Hackers: How I Got My First 100 Users",
    domain: "indiehackers.com",
    category: "Articles",
    categoryIndex: 1,
  },
  {
    id: 3,
    title: "Dribbble — Dashboard Design Inspiration",
    domain: "dribbble.com",
    category: "Inspiration",
    categoryIndex: 2,
  },
  {
    id: 4,
    title: "Build a SaaS with Supabase & React",
    domain: "youtube.com",
    category: "Tutorials",
    categoryIndex: 3,
  },
];

const VaultPage = () => {
  const resources = sampleResources;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="font-heading text-3xl text-foreground mb-1">Resource Vault</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Your vault stays tidy—one link at a time.
        </p>
      </motion.div>

      {/* Category chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`rounded-pill px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {resources.length === 0 ? (
        <EmptyState
          icon={<Archive />}
          title="Your bookmarks go here"
          subtitle="Save tools, articles, and inspiration—all in one place."
        />
      ) : (
        <div className="space-y-3">
          {resources.map((res, i) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="card-glass p-5 cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Favicon placeholder */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground text-sm font-semibold">
                  {res.domain.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-[15px] truncate">{res.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    {res.domain}
                    <ExternalLink size={11} />
                  </p>
                </div>
                <TagChip label={res.category} colorIndex={res.categoryIndex} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultPage;
