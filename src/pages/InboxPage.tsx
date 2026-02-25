import { motion } from "framer-motion";
import { Inbox, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import TagChip from "@/components/TagChip";

const sampleIdeas = [
  {
    id: 1,
    title: "AI-powered changelog generator",
    note: "Pull git commits and generate user-facing changelogs automatically",
    tags: ["product", "AI"],
    date: "Today",
  },
  {
    id: 2,
    title: "Micro-SaaS for freelancers",
    note: "Invoice + time tracking in one clean tool",
    tags: ["SaaS", "design"],
    date: "Yesterday",
  },
];

const InboxPage = () => {
  const ideas = sampleIdeas; // will be replaced with Cloud data

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="font-heading text-3xl text-foreground mb-1">Idea Inbox</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Capture fast. Organize later.
        </p>
      </motion.div>

      {ideas.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title="Drop your first spark"
          subtitle="Messy is welcome. Tap Quick Add to capture an idea—title is all you need."
        />
      ) : (
        <div className="space-y-3">
          {ideas.map((idea, i) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="card-glass p-5 cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-[15px] mb-1">{idea.title}</h3>
                  {idea.note && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {idea.note}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {idea.tags.map((tag, ti) => (
                      <TagChip key={tag} label={tag} colorIndex={ti} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">{idea.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxPage;
