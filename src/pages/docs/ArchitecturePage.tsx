const ArchitecturePage = () => (
  <div className="space-y-8 prose-sm">
    <div>
      <h1 className="text-3xl mb-3">Architecture</h1>
      <p className="text-muted-foreground text-lg">System architecture, tech stack, and how everything connects.</p>
    </div>

    <section className="space-y-3">
      <h2 className="text-xl">Tech Stack</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Layer</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Technology</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              ["Frontend", "React 18 + TypeScript + Vite"],
              ["Styling", "Tailwind CSS + shadcn/ui + Framer Motion"],
              ["State", "TanStack React Query (server) + useState (local)"],
              ["Routing", "React Router v6 (nested routes)"],
              ["Backend", "Lovable Cloud — Postgres, Auth, Edge Functions, Storage"],
              ["Deployment", "Lovable Cloud hosting"],
            ].map(([layer, tech]) => (
              <tr key={layer}>
                <td className="py-2 pr-4 font-medium text-foreground">{layer}</td>
                <td className="py-2 text-muted-foreground">{tech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Architecture Diagram</h2>
      <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-x-auto font-mono text-foreground">
{`┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  React + Vite + Tailwind + shadcn           │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Pages   │ │Components│ │  Hooks   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│         │           │            │           │
│         └───────────┼────────────┘           │
│                     │                        │
│              supabase-js SDK                 │
└─────────────────────┼───────────────────────┘
                      │
┌─────────────────────┼───────────────────────┐
│              Lovable Cloud                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   Auth   │ │ Postgres │ │  Storage │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────────────────────────────────┐   │
│  │         Edge Functions               │   │
│  │  fetch-url-metadata | generate-tags  │   │
│  │  generate-summary | create-checkout  │   │
│  │  check-subscription | customer-portal│   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘`}
      </pre>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Folder Structure</h2>
      <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-x-auto font-mono text-foreground">
{`src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives (Button, Dialog, etc.)
│   └── ...           # App-specific components (modals, cards)
├── contexts/         # React context providers (AuthContext)
├── hooks/            # Custom hooks for data fetching (useIdeas, etc.)
├── integrations/     # Supabase client & generated types
├── lib/              # Utility functions (cn, etc.)
├── pages/            # Route-level page components
│   └── docs/         # Documentation Center pages
├── index.css         # Global styles, CSS tokens, design system
└── main.tsx          # App entry point

supabase/
├── functions/        # Edge functions (Deno)
│   ├── fetch-url-metadata/
│   ├── generate-tags/
│   ├── generate-summary/
│   ├── create-checkout/
│   ├── check-subscription/
│   └── customer-portal/
└── config.toml       # Supabase project configuration

docs/                 # Project documentation (markdown)
├── masterplan.md     # Vision, personas, feature pillars
├── tasks.md          # Implementation task tracker
├── rules.md          # Architecture decisions & conventions
├── changelog.md      # Change history
├── design.md         # Design system & UX guidelines
└── implementation.md # Technical implementation guide`}
      </pre>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Database Schema Overview</h2>
      <p className="text-muted-foreground text-sm">All tables use Row Level Security (RLS). Frontend hooks also explicitly filter by <code className="bg-muted px-1 rounded text-xs">user_id</code> for defense-in-depth.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Table</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Purpose</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Key Columns</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {[
              ["ideas", "Quick-capture idea inbox", "title, note, tags[], links[]"],
              ["prompts", "AI prompt library", "title, content, summary, tags[]"],
              ["resources", "Bookmarked links & files", "title, url, category, og_title, cover_image_url"],
              ["builds", "Project tracking (deferred)", "name, status, lovable_url"],
              ["profiles", "User profiles", "display_name, avatar_url, is_public"],
              ["public_artifacts", "Community-shared items", "artifact_type, prompt/resource fields"],
              ["saved_artifacts", "Bookmarked community items", "artifact_id, user_id"],
              ["follows / follow_requests", "Social graph", "follower_id, following_id, status"],
              ["user_roles", "Admin/moderator system", "user_id, role"],
            ].map(([table, purpose, cols]) => (
              <tr key={table}>
                <td className="py-2 pr-4 font-mono text-foreground">{table}</td>
                <td className="py-2 pr-4 text-muted-foreground">{purpose}</td>
                <td className="py-2 text-muted-foreground">{cols}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Authentication Flow</h2>
      <div className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-foreground">
        <p>1. User signs up via email/password → verification email sent</p>
        <p>2. User verifies email → can log in</p>
        <p>3. On first login → DB trigger creates profile row</p>
        <p>4. AuthContext provides user + profile + subscription state globally</p>
        <p>5. ProtectedRoute redirects unauthenticated users to /auth</p>
        <p>6. PublicOnlyRoute redirects authenticated users to /ideas</p>
      </div>
    </section>
  </div>
);

export default ArchitecturePage;
