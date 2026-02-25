import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import TagChip from "@/components/TagChip";

const samplePrompts = [
  {
    id: 1,
    title: "Landing page hero copy",
    body: "Write a compelling hero section for a SaaS product that...",
    tags: ["marketing", "copy"],
    useCase: "Marketing",
  },
  {
    id: 2,
    title: "Code review checklist prompt",
    body: "Act as a senior engineer. Review the following code for...",
    tags: ["code", "review"],
    useCase: "Engineering",
  },
  {
    id: 3,
    title: "Product brief generator",
    body: "Given the following feature request, generate a structured product brief...",
    tags: ["product", "planning"],
    useCase: "Product",
  },
];

const filterTags = ["All", "Marketing", "Code", "Product", "Design"];

const PromptsPage = () => {
  const prompts = samplePrompts;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="font-heading text-3xl text-foreground mb-1">Prompt Library</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Your go-to prompts, saved and ready.
        </p>
      </motion.div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTags.map((tag, i) => (
          <button
            key={tag}
            className={`rounded-pill px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {prompts.length === 0 ? (
        <EmptyState
          icon={<Sparkles />}
          title="Your prompt cards will appear here"
          subtitle="Save prompts you use often—marketing, code, product, design."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="card-glass p-5 cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <TagChip label={prompt.useCase} colorIndex={i} />
              </div>
              <h3 className="font-medium text-foreground text-[15px] mb-2">{prompt.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                {prompt.body}
              </p>
              <div className="flex gap-1.5 mt-3">
                {prompt.tags.map((tag, ti) => (
                  <TagChip key={tag} label={tag} colorIndex={ti + 2} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptsPage;
