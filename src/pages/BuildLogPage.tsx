import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import EmptyState from "@/components/EmptyState";

type ProjectStatus = "Idea" | "In Progress" | "Shipped" | "Archived";

const statusStyles: Record<ProjectStatus, string> = {
  "Idea": "bg-status-idea",
  "In Progress": "bg-status-progress",
  "Shipped": "bg-status-shipped",
  "Archived": "bg-status-archived",
};

const sampleProjects = [
  {
    id: 1,
    name: "LinkFolio",
    description: "A minimal link-in-bio tool for makers",
    status: "In Progress" as ProjectStatus,
    milestones: ["Landing page designed", "Auth flow built", "Beta invites sent"],
  },
  {
    id: 2,
    name: "PromptVault",
    description: "Chrome extension to save & reuse prompts",
    status: "Idea" as ProjectStatus,
    milestones: ["Market research"],
  },
  {
    id: 3,
    name: "ShipLog",
    description: "Public build log for indie projects",
    status: "Shipped" as ProjectStatus,
    milestones: ["MVP launched", "100 users", "Product Hunt feature"],
  },
];

const BuildLogPage = () => {
  const projects = sampleProjects;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="font-heading text-3xl text-foreground mb-1">Build Log</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Shipping is a habit. Log the work.
        </p>
      </motion.div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Rocket />}
          title="Start logging your builds"
          subtitle="Track projects from idea to shipped. Every milestone counts."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="card-glass p-5 cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium text-foreground/80 ${statusStyles[project.status]}`}
                >
                  {project.status}
                </span>
              </div>
              <h3 className="font-heading text-lg text-foreground mb-1">{project.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                {project.description}
              </p>

              {/* Milestones */}
              <ul className="space-y-1.5">
                {project.milestones.map((ms, mi) => (
                  <li key={mi} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                    {ms}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildLogPage;
