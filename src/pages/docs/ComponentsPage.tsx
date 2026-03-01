const components = [
  {
    category: "Layout",
    items: [
      { name: "AppShell", file: "src/components/AppShell.tsx", description: "Main app layout with floating top nav (desktop), bottom tabs (mobile), profile dropdown, trial/upgrade banners.", props: "children" },
      { name: "DocsLayout", file: "src/components/DocsLayout.tsx", description: "Documentation Center layout with sidebar navigation and content outlet.", props: "Outlet (via React Router)" },
      { name: "FloatingActionButton", file: "src/components/FloatingActionButton.tsx", description: "Liquid-glass FAB for quick-add actions. Fixed position, opens QuickAddModal.", props: "—" },
    ],
  },
  {
    category: "Modals",
    items: [
      { name: "AddIdeaModal", file: "src/components/AddIdeaModal.tsx", description: "Form modal for creating new ideas with title, note, tags, and links.", props: "open, onOpenChange" },
      { name: "AddPromptModal", file: "src/components/AddPromptModal.tsx", description: "Form modal for creating prompts with title, content, and tags.", props: "open, onOpenChange" },
      { name: "AddResourceModal", file: "src/components/AddResourceModal.tsx", description: "Form modal for adding resources by URL or file upload. Auto-fetches metadata.", props: "open, onOpenChange" },
      { name: "IdeaDetailModal", file: "src/components/IdeaDetailModal.tsx", description: "Detail view for an idea with edit capability.", props: "idea, open, onOpenChange" },
      { name: "PromptDetailModal", file: "src/components/PromptDetailModal.tsx", description: "Full prompt view with copy-to-clipboard action.", props: "prompt, open, onOpenChange" },
      { name: "ResourceDetailModal", file: "src/components/ResourceDetailModal.tsx", description: "Detail view for a resource with link and metadata.", props: "resource, open, onOpenChange" },
      { name: "PublishArtifactModal", file: "src/components/PublishArtifactModal.tsx", description: "Modal to publish a prompt or resource to the community.", props: "artifact, type, open, onOpenChange" },
      { name: "QuickAddModal", file: "src/components/QuickAddModal.tsx", description: "Multi-option quick-add picker (idea, prompt, resource).", props: "open, onOpenChange" },
      { name: "UpgradeModal", file: "src/components/UpgradeModal.tsx", description: "Pro upgrade modal with pricing and checkout CTA.", props: "open, onOpenChange, onCheckout, trialDaysLeft" },
      { name: "ChangePasswordModal", file: "src/components/ChangePasswordModal.tsx", description: "Password change form modal.", props: "open, onOpenChange" },
      { name: "CopyToProjectModal", file: "src/components/CopyToProjectModal.tsx", description: "Copy community artifact to personal library.", props: "artifact, open, onOpenChange" },
    ],
  },
  {
    category: "Cards & Display",
    items: [
      { name: "ArtifactCard", file: "src/components/ArtifactCard.tsx", description: "Community artifact card showing title, tags, type badge, and save button.", props: "artifact, onSave" },
      { name: "BuildCard", file: "src/components/BuildCard.tsx", description: "Project card with status badge and Lovable URL link.", props: "build, onClick" },
      { name: "TagChip", file: "src/components/TagChip.tsx", description: "Colored pill tag using chip color rotation.", props: "tag, index, onClick" },
      { name: "EmptyState", file: "src/components/EmptyState.tsx", description: "Empty state illustration with contextual CTA button.", props: "title, description, action, onAction" },
    ],
  },
  {
    category: "Deferred (Build Module)",
    items: [
      { name: "ExecutionBoard", file: "src/components/ExecutionBoard.tsx", description: "Task board with today/next/backlog buckets and drag-and-drop.", props: "buildId" },
      { name: "DecisionVault", file: "src/components/DecisionVault.tsx", description: "Decision log with context and outcome fields.", props: "buildId" },
      { name: "ShippingLog", file: "src/components/ShippingLog.tsx", description: "Timeline of shipped features and milestones.", props: "buildId" },
      { name: "SessionDebrief", file: "src/components/SessionDebrief.tsx", description: "Reflection form: what shipped, learned, blockers, next plan.", props: "buildId" },
    ],
  },
];

const ComponentsPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl mb-3">Components</h1>
      <p className="text-muted-foreground text-lg">All major components, their purpose, and key props.</p>
    </div>

    {components.map((cat) => (
      <section key={cat.category} className="space-y-3">
        <h2 className="text-xl">{cat.category}</h2>
        <div className="space-y-2">
          {cat.items.map((c) => (
            <div key={c.name} className="card-glass p-4 space-y-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-sm font-semibold text-foreground">{c.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono">{c.file}</span>
              </div>
              <p className="text-sm text-muted-foreground">{c.description}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Props:</span> {c.props}
              </p>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export default ComponentsPage;
