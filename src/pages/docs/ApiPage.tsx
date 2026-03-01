const ApiPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl mb-3">API Reference</h1>
      <p className="text-muted-foreground text-lg">All backend functions, their inputs, outputs, and usage.</p>
    </div>

    <section className="space-y-4">
      <h2 className="text-xl">Edge Functions</h2>

      {[
        {
          name: "fetch-url-metadata",
          method: "POST",
          description: "Fetches Open Graph metadata from a given URL. Returns title, description, image URL, and favicon.",
          input: `{ "url": "https://example.com" }`,
          output: `{ "ogTitle": "Example", "ogDescription": "...", "ogImage": "https://...", "favicon": "https://..." }`,
          usedBy: "AddResourceModal — auto-fills resource fields when user pastes a URL.",
        },
        {
          name: "generate-tags",
          method: "POST",
          description: "AI-powered tag generation using Lovable AI Gateway. Analyzes text and suggests relevant tags.",
          input: `{ "text": "Build a SaaS dashboard with Stripe integration", "existingTags": ["saas"] }`,
          output: `{ "tags": ["saas", "stripe", "dashboard", "billing"] }`,
          usedBy: "Not yet wired into UI (task 5A.3).",
        },
        {
          name: "generate-summary",
          method: "POST",
          description: "AI-powered prompt summarization. Creates a concise summary of a prompt's content.",
          input: `{ "content": "You are a senior developer..." }`,
          output: `{ "summary": "Code review prompt for senior-level feedback" }`,
          usedBy: "AddPromptModal — auto-generates summary on save. Shown on prompt cards.",
        },
        {
          name: "create-checkout",
          method: "POST",
          description: "Creates a Stripe Checkout session for Pro subscription.",
          input: `{ "priceId": "price_...", "userId": "uuid" }`,
          output: `{ "url": "https://checkout.stripe.com/..." }`,
          usedBy: "UpgradeModal → redirects user to Stripe Checkout.",
          auth: "Requires authenticated user.",
        },
        {
          name: "check-subscription",
          method: "POST",
          description: "Checks user's subscription status and trial period.",
          input: `{ "userId": "uuid" }`,
          output: `{ "subscribed": false, "trial_active": true, "trial_days_left": 10, "can_write": true }`,
          usedBy: "AuthContext — called on login to determine access level.",
          auth: "Requires authenticated user.",
        },
        {
          name: "customer-portal",
          method: "POST",
          description: "Creates a Stripe Customer Portal session for subscription management.",
          input: `{ "userId": "uuid" }`,
          output: `{ "url": "https://billing.stripe.com/..." }`,
          usedBy: "ProfilePage — 'Manage subscription' link.",
          auth: "Requires authenticated user.",
        },
      ].map((fn) => (
        <div key={fn.name} className="card-glass p-5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">{fn.method}</span>
            <span className="font-mono text-sm font-semibold text-foreground">{fn.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{fn.description}</p>
          
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-foreground/70">Input:</span>
              <pre className="bg-muted/50 rounded p-2 text-xs font-mono mt-1 overflow-x-auto">{fn.input}</pre>
            </div>
            <div>
              <span className="text-xs font-medium text-foreground/70">Output:</span>
              <pre className="bg-muted/50 rounded p-2 text-xs font-mono mt-1 overflow-x-auto">{fn.output}</pre>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">Used by:</span> {fn.usedBy}
          </p>
          {fn.auth && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">Auth:</span> {fn.auth}
            </p>
          )}
        </div>
      ))}
    </section>

    <section className="space-y-3">
      <h2 className="text-xl">Storage Buckets</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Bucket</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Public</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            <tr>
              <td className="py-2 pr-4 font-mono text-foreground">resource-files</td>
              <td className="py-2 pr-4 text-muted-foreground">Yes</td>
              <td className="py-2 text-muted-foreground">Uploaded resource files (PDFs, images, etc.)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-foreground">avatars</td>
              <td className="py-2 pr-4 text-muted-foreground">Yes</td>
              <td className="py-2 text-muted-foreground">User profile pictures</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

export default ApiPage;
