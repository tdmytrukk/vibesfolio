const DataFlowPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl mb-3">Data Flow</h1>
      <p className="text-muted-foreground text-lg">How data moves through the application — from user input to database and back.</p>
    </div>

    <section className="space-y-3">
      <h2 className="text-xl">General Pattern</h2>
      <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
{`User Action (click, form submit)
    │
    ▼
React Component (page or modal)
    │
    ▼
Custom Hook (useIdeas, usePrompts, etc.)
    │  ← uses TanStack React Query for caching & refetching
    ▼
Supabase JS SDK (.from("table").select/insert/update/delete)
    │  ← explicit .eq("user_id", user.id) filter
    ▼
Lovable Cloud (Postgres with RLS)
    │  ← Row Level Security as second defense layer
    ▼
Response → React Query cache → UI re-renders`}
      </pre>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Authentication Flow</h2>
      <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
{`AuthPage (signup/login form)
    │
    ├─ Email auth → supabase.auth.signUp() / signInWithPassword()
    │
    └─ Google auth
          ├─ Lovable-hosted domains → lovable.auth.signInWithOAuth()
          └─ Custom domains → supabase.auth.signInWithOAuth({ skipBrowserRedirect: true })
                              → validate returned OAuth URL host
                              → window.location.assign(oauthUrl)
    │
    ▼
AuthContext.onAuthStateChange() fires
    │
    ▼
Loads profile from "profiles" table
    │
    ▼
Checks subscription via "check-subscription" edge function
    │
    ▼
{ user, profile, subscription } available globally via useAuth()
    │
    ▼
ProtectedRoute grants access to app routes
PublicOnlyRoute redirects logged-in users away from /auth`}
      </pre>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Resource Save Flow (with metadata)</h2>
      <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
{`User pastes URL in AddResourceModal
    │
    ▼
Edge function: fetch-url-metadata(url)
    │  → fetches OG title, description, image, favicon
    ▼
Modal auto-fills title, description, cover image
    │
    ▼
User confirms → useResources.addResource()
    │
    ▼
supabase.from("resources").insert({...})
    │
    ▼
React Query invalidates "resources" → grid re-renders`}
      </pre>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Community Publish Flow</h2>
      <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
{`User opens PublishArtifactModal on a prompt or resource
    │
    ▼
Creates entry in "public_artifacts" table
    │  → copies relevant fields (title, tags, content/url)
    ▼
Artifact appears in CommunityPage feed
    │
    ▼
Other users can:
    ├─ Save artifact → saved_artifacts table
    └─ View builder profile → follow system`}
      </pre>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Subscription / Gating Flow</h2>
      <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
{`On login → AuthContext calls check-subscription edge function
    │
    ▼
Edge function checks Stripe for active subscription
    │  → also calculates trial status from profiles.trial_started_at
    ▼
Returns: { subscribed, trial_active, trial_days_left, can_write }
    │
    ▼
AppShell shows:
    ├─ Trial banner (≤7 days left)
    ├─ Expired banner (can_write = false)
    └─ UpgradeModal → create-checkout edge function → Stripe Checkout`}
      </pre>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Hook → Table Mapping</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Hook</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Table</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {[
              ["useIdeas", "ideas", "CRUD + tag filter"],
              ["usePrompts", "prompts", "CRUD + tag filter + summary generation"],
              ["useResources", "resources", "CRUD + category/tag filter + metadata fetch"],
              ["useBuilds", "builds", "CRUD + status update"],
              ["usePublicArtifacts", "public_artifacts", "Read + filter by type/tag"],
              ["useSavedArtifacts", "saved_artifacts", "Save/unsave community items"],
              ["useFollows", "follows + follow_requests", "Follow/unfollow + request management"],
              ["useSubscription", "—", "Calls check-subscription & create-checkout edge functions"],
              ["useDecisions", "decisions", "CRUD scoped to build_id"],
              ["useShippingLog", "shipping_log", "CRUD scoped to build_id"],
              ["useDebriefs", "session_debriefs", "CRUD scoped to build_id"],
              ["useTasks", "project_tasks", "CRUD + drag-and-drop reorder"],
              ["useMission", "project_missions", "Read/update active mission"],
            ].map(([hook, table, ops]) => (
              <tr key={hook}>
                <td className="py-2 pr-4 font-mono text-foreground">{hook}</td>
                <td className="py-2 pr-4 font-mono text-muted-foreground">{table}</td>
                <td className="py-2 text-muted-foreground">{ops}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

export default DataFlowPage;
