import { NavLink } from "react-router-dom";
import { Layers, Component, ArrowRightLeft, Server, Package } from "lucide-react";

const sections = [
  { to: "/docs/architecture", label: "Architecture", icon: Layers, description: "Tech stack, folder structure, frontend–backend connection, database schema" },
  { to: "/docs/components", label: "Components", icon: Component, description: "Major components, their purpose, where they're used, and key props" },
  { to: "/docs/data-flow", label: "Data Flow", icon: ArrowRightLeft, description: "How data moves from user input → UI → API → database and back" },
  { to: "/docs/api", label: "API Reference", icon: Server, description: "All backend functions, their inputs, outputs, and usage examples" },
  { to: "/docs/dependencies", label: "Dependencies", icon: Package, description: "Third-party libraries and services, why they're used, what breaks without them" },
];

const DocsHomePage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl mb-3">Documentation</h1>
      <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
        Vibesfolio is a workspace for vibe-builders and AI learners to capture ideas, save prompts, and curate resources. This documentation covers the full architecture, components, data flows, APIs, and dependencies.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {sections.map((s) => (
        <NavLink
          key={s.to}
          to={s.to}
          className="group card-glass p-5 flex gap-4 items-start hover:shadow-md transition-shadow"
        >
          <div className="rounded-lg bg-secondary p-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
            <s.icon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{s.label}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
          </div>
        </NavLink>
      ))}
    </div>

    <div className="card-glass p-5 space-y-3">
      <h2 className="text-xl">Quick Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { label: "Pages", value: "9" },
          { label: "Components", value: "30+" },
          { label: "Hooks", value: "14" },
          { label: "Edge Functions", value: "6" },
        ].map((s) => (
          <div key={s.label} className="py-3">
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DocsHomePage;
