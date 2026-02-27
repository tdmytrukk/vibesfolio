## Update Landing Page CTA Copy

The landing page feature list already doesn't include Build Cockpit — it only shows Idea Inbox, Prompt Library, Resource Vault, and Community. No removal needed there.

The CTAs will be updated to better match the "calm workspace for capturing and organizing" positioning:

### Changes in `src/pages/LandingPage.tsx`

**Hero CTA button** (line 84):

- "Start Building Free" → "Get Started"

**Hero secondary button** (line 92):

- "See Features" → stays (fine as-is)

**Bottom CTA section** (lines 149-159):

- Headline: "Ready to build smarter with AI?" → "Your ideas deserve a home"
- Button: "Create Your Free Account" → "Start Your Free Space"

Single file changed: `src/pages/LandingPage.tsx` — copy-only edits across 4 strings.