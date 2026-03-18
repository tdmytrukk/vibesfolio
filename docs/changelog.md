# Changelog

All notable changes to this project will be documented in this file.

## [2026-03-18]

### Added
- New `Logo` component (`src/components/Logo.tsx`) — reusable SVG logo mark (black circle + white V chevron) with text, supports `small`/`default`/`large` sizes and optional `showText` prop
- Replaced all text-only "Vibesfolio" branding with the new Logo component across AppShell, LandingPage, AuthPage, SharedArtifactPage, DocsLayout, and App loading screen
- `ProfileVisibilityPrompt` dialog — asks users with private profiles to make their profile visible before publishing content
- `useProfileVisibility` hook — checks profile visibility status and gates publish actions behind the prompt
- Integrated visibility check into `PublishToggle`, `ShareToCommunityToggle`, and `PublishArtifactModal`
- Confirmed that `is_public` defaults to `false` for new profiles in the database schema

### Fixed
- Auth redirect after email login pointed to `/log` (non-existent route) — now correctly goes to `/ideas`
- Added success toast on email sign-in so users get immediate visual feedback while redirect processes
- Fixed confusing post-login freeze — AuthPage now shows a signed-in loading handoff, and auth-protected routing shows a visible loading screen instead of silent blank states while the workspace boots. (`src/pages/AuthPage.tsx`, `src/App.tsx`)

### Added
- Admin dashboard at `/admin` — protected page only visible to users with `admin` role. Includes: Feedback manager (view/update status), Total signups with weekly growth, Content overview (prompts, resources, ideas, builds, artifacts counts), Most active users leaderboard. Admin link appears in profile dropdown only for admin users. (`src/pages/AdminPage.tsx`, `src/hooks/useAdminData.ts`, `src/components/AppShell.tsx`, `src/App.tsx`)
- Ban/unban/delete user actions in admin dashboard. Soft ban sets `is_banned` flag on profiles, signs user out on next login. Delete permanently removes user + all data via `admin-manage-user` edge function. Confirmation dialog for all destructive actions. (`src/pages/AdminPage.tsx`, `src/hooks/useAdminData.ts`, `src/contexts/AuthContext.tsx`, `supabase/functions/admin-manage-user/index.ts`)

## [2026-03-17]

### Changed
- Subscription temporarily disabled — App is now free for all users until 100 active users milestone. `fetchSubscription` bypassed in AuthContext; default subscription grants full `can_write` access. Trial banners and upgrade prompts still exist in code but won't trigger. (`src/contexts/AuthContext.tsx`)

### Changed
- Community page search bar standardized — replaced `<Input>` component with raw `<input>` matching the exact same style (rounded-pill, py-2.5, border-border/40, shadow-sm) used on Prompts and Resources pages for visual consistency. (`src/pages/CommunityPage.tsx`)
- Modal centering fix — Fixed framer-motion overriding CSS `-translate-y-1/2` on PromptDetailModal and ResourceDetailModal, causing modals to appear at the bottom instead of centered. Now uses `y: "-50%"` in the animate prop. (`src/components/PromptDetailModal.tsx`, `src/components/ResourceDetailModal.tsx`)
- Global search highlight — Clicking a search result now auto-opens the detail modal on Prompts, Ideas, and Resources pages via `?highlight=id` query param. (`src/pages/PromptsPage.tsx`, `src/pages/InboxPage.tsx`, `src/pages/VaultPage.tsx`)
- Feature section remix — Replaced 2×2 grid with auto-cycling FeatureSteps component (numbered steps, progress bar, animated image panel with 3D rotateX transitions). (`src/components/FeatureSteps.tsx`, `src/pages/LandingPage.tsx`)

## [2026-03-16]

### Changed
- Landing page copy refresh — Replaced repetitive "Stop..." marketing phrasing with builder-friendly alternatives across hero, feature cards, and bottom CTA. (`src/pages/LandingPage.tsx`)
- Community cover images fix — Fixed `publishArtifact` to insert first then fetch cover image async; `ShareToCommunityToggle` now accepts and passes `coverImageUrl`; added backfill for existing null cover images; ArtifactCard shows favicon fallback when no cover image. (`src/hooks/usePublicArtifacts.ts`, `src/components/ShareToCommunityToggle.tsx`, `src/components/ArtifactCard.tsx`)
- Action bar simplification — Merged two-row actions into single row; removed text labels from Open/Copy/Edit (icon-only); moved Delete button out of main card; changed Publish icon from Upload to Radio. (`src/components/PromptDetailModal.tsx`, `src/components/ResourceDetailModal.tsx`, `src/components/PublishToggle.tsx`)
- Share vs Publish redesign — Split `ShareToCommunityToggle` into `PublishToggle` and `ShareButton`. Created public `SharedArtifactPage` at `/shared/:artifactId`. Added green dot indicator for published items. (`src/components/PublishToggle.tsx`, `src/components/ShareButton.tsx`, `src/pages/SharedArtifactPage.tsx`)
- Phase 5B complete — Global search via ⌘K/Ctrl+K command palette with categorized results and `?highlight=id` navigation. (`src/hooks/useSearch.ts`, `src/components/GlobalSearch.tsx`, `src/components/AppShell.tsx`)

## [2026-03-03]

### Changed
- Masterplan revision — removed Build Log, Cockpit, session debriefs, shipping logs from active feature pillars; updated value loop, success metrics, product principles, personas, and risks to reflect current positioning around ideas, prompts, resources & community (`docs/masterplan.md`)

## [2026-03-02]

### Added
- Feedback & Support system — new `feedback` database table with RLS, `send-feedback-email` edge function, `useFeedback` hook, and "Feedback & Support" card on Profile page with email field, type selector (Bug/Feedback/Question), and message textarea; admin can view all submissions with sender email

## [2026-03-01]

### Added
- Community page redesign — replaced messy masonry feed with clean single-column layout inspired by curated launch feeds; new ArtifactCard with hero image (16:9), title, tagline, compact meta row; new ArtifactDetailModal for tap-to-view with full content, external links, save/copy/follow actions. (`src/pages/CommunityPage.tsx`, `src/components/ArtifactCard.tsx`, `src/components/ArtifactDetailModal.tsx`)
- Mobile-first Community page tightening — inlined Builders button with tabs, reduced page/card spacing, compacted resource card image areas, combined domain+type badge into single meta line, limited tags to 2 on small screens. (`src/pages/CommunityPage.tsx`, `src/components/ArtifactCard.tsx`)
- Fixed AddPromptModal CTA button being hidden behind mobile bottom nav — adjusted `bottom` offset and `max-h` to clear nav bar (`src/components/AddPromptModal.tsx`)
- Multi-section prompts — new `prompt_sections` table, AddPromptModal dynamic section UI, PromptDetailModal per-section copy buttons, drag-and-drop reordering via @dnd-kit, data migration for existing prompts. (`src/hooks/usePrompts.ts`, `src/components/AddPromptModal.tsx`, `src/components/PromptDetailModal.tsx`, `src/pages/PromptsPage.tsx`, `src/components/CopyToProjectModal.tsx`)
- Phase 5C complete — 2-step onboarding welcome tour for new users with seed data option (`src/hooks/useOnboarding.ts`, `src/components/WelcomeTour.tsx`, `src/pages/InboxPage.tsx`)
- Phase 5A complete — added success toasts for all CRUD ops (ideas, prompts, resources) via sonner; added `updated_at` triggers for `project_tasks` and `project_missions` tables. (`src/pages/InboxPage.tsx`, `src/pages/PromptsPage.tsx`, `src/pages/VaultPage.tsx`)
- Created `docs/rules.md` — project rules & decisions file (`docs/rules.md`)
- UI polish pass — card-glass hover lift + shadow transitions, EmptyState redesign, TagChip tracking refinement, subtle hover/tap animations across pages. (`src/index.css`, `src/components/TagChip.tsx`, `src/components/EmptyState.tsx`, multiple pages)
- Built Documentation Center at `/docs` with sidebar layout and 6 pages: Overview, Architecture, Components, Data Flow, API, Dependencies (`src/components/DocsLayout.tsx`, `src/pages/docs/*.tsx`, `src/App.tsx`)
- XML sitemap at `/sitemap.xml` with all public routes; updated `robots.txt` with Sitemap directive (`public/sitemap.xml`, `public/robots.txt`)
- Dark mode support — wired `next-themes` ThemeProvider, added theme picker to onboarding, Appearance toggle on ProfilePage, dark gradient + texture overlay. (`src/App.tsx`, `src/index.css`, `src/components/WelcomeTour.tsx`, `src/pages/ProfilePage.tsx`, `src/components/AppShell.tsx`)
- Community feed privacy — feed now only shows artifacts from followed users + own; added "Discover" tab for browsing all public artifacts. (`src/hooks/usePublicArtifacts.ts`, `src/pages/CommunityPage.tsx`)
- Resources mobile layout overhaul — matched Community card style with aspect-video hero images, cleaner title/domain meta, hidden descriptions and tags on mobile. (`src/pages/VaultPage.tsx`)

### Changed
- Authenticated users now redirect to `/log` (Projects) instead of `/vault`; unauthenticated users see landing page at `/` (`src/App.tsx`, `src/pages/AuthPage.tsx`)

### Removed
- Dropped Phase 5D (Analytics & Insights) — tasks 5D.1 (personal stats dashboard) and 5D.2 (streak tracking) removed from roadmap; not collecting usage metrics (`docs/tasks.md`)

## [2026-02-27]

### Added
- Public landing page at `/` with hero section, feature highlights, and sign-up CTA (`src/pages/LandingPage.tsx`, `src/App.tsx`)
- SEO meta tags — title, description, OG image, Twitter card, canonical URL (`index.html`, `public/images/og-image.png`)
- Initial project setup

---

**Format for new entries:**

- **Added** for new features
- **Changed** for changes in existing functionality
- **Fixed** for bug fixes
- **Removed** for removed features
- **Security** for security improvements

**Rules:**

- Add a new entry after every completed task or group of related tasks
- Include the date, a short description, and files affected
- This is a historical log — never edit or delete past entries
