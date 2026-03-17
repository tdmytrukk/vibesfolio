# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- **2026-03-17**: Global search highlight — Clicking a search result now auto-opens the detail modal on Prompts, Ideas, and Resources pages via `?highlight=id` query param. (`src/pages/PromptsPage.tsx`, `src/pages/InboxPage.tsx`, `src/pages/VaultPage.tsx`)
- **2026-03-17**: Feature section remix — Replaced 2×2 grid with auto-cycling FeatureSteps component (numbered steps, progress bar, animated image panel with 3D rotateX transitions). Images use placeholders pending screenshots. (`src/components/FeatureSteps.tsx`, `src/pages/LandingPage.tsx`)
- **2026-03-16**: Landing page copy refresh — Replaced repetitive "Stop..." marketing phrasing with builder-friendly alternatives across hero, feature cards, and bottom CTA. (`src/pages/LandingPage.tsx`)
- **2026-03-16**: Community cover images fix — Fixed `publishArtifact` to insert first then fetch cover image async; `ShareToCommunityToggle` now accepts and passes `coverImageUrl`; added backfill for existing null cover images; ArtifactCard shows favicon fallback when no cover image. (`src/hooks/usePublicArtifacts.ts`, `src/components/ShareToCommunityToggle.tsx`, `src/components/ArtifactCard.tsx`)
- **2026-03-16**: Action bar simplification — Merged two-row actions into single row; removed text labels from Open/Copy/Edit (icon-only); moved Delete button out of main card (appears only in edit mode for resources, handled via edit modal for prompts); changed Publish icon from Upload to Radio to match Community icon. (`src/components/PromptDetailModal.tsx`, `src/components/ResourceDetailModal.tsx`, `src/components/PublishToggle.tsx`)
- **2026-03-16**: Share vs Publish redesign — Split `ShareToCommunityToggle` into `PublishToggle` (green dot "Live" indicator with unpublish popover) and `ShareButton` (Web Share API / copy link / X / LinkedIn). Created public `SharedArtifactPage` at `/shared/:artifactId` for unauthenticated viewing. Updated `PromptDetailModal`, `ResourceDetailModal`, `VaultPage`, and `PromptsPage` cards with green dot indicator for published items. (`src/components/PublishToggle.tsx`, `src/components/ShareButton.tsx`, `src/pages/SharedArtifactPage.tsx`)
- **2026-03-16**: Phase 5B complete — Global search via ⌘K/Ctrl+K command palette; `useSearch` hook queries ideas/prompts/resources with debounced ilike; `GlobalSearch` component with categorized results; search button in desktop nav + mobile header; navigates to page with `?highlight=id` (`src/hooks/useSearch.ts`, `src/components/GlobalSearch.tsx`, `src/components/AppShell.tsx`)
- **2026-03-03**: Masterplan revision — removed Build Log, Cockpit, session debriefs, shipping logs from active feature pillars; updated value loop, success metrics, product principles, personas, and risks to reflect current positioning around ideas, prompts, resources & community (`docs/masterplan.md`)

### Added

- Initial project setup
- **2026-03-02**: Feedback & Support system — new `feedback` database table with RLS, `send-feedback-email` edge function, `useFeedback` hook, and "Feedback & Support" card on Profile page with email field, type selector (Bug/Feedback/Question), and message textarea; admin can view all submissions with sender email
- **2026-03-01**: Community page redesign — replaced messy masonry feed with clean single-column layout inspired by curated launch feeds; new ArtifactCard with hero image (16:9), title, tagline, compact meta row; new ArtifactDetailModal for tap-to-view with full content, external links, save/copy/follow actions; removed all in-card noise (RESOURCE labels, categories, domain lines, inline prompt preview); rounded pill tabs; large rounded search bar (`src/pages/CommunityPage.tsx`, `src/components/ArtifactCard.tsx`, `src/components/ArtifactDetailModal.tsx`)
- **2026-03-01**: Mobile-first Community page tightening — inlined Builders button with tabs, reduced page/card spacing via responsive prefixes, compacted resource card image areas (shorter fallback, lower max-height), combined domain+type badge into single meta line, hid `resource_note`/`resource_when_to_use` on mobile, limited tags to 2 on small screens, all desktop-safe via `sm:`/`md:` breakpoints (`src/pages/CommunityPage.tsx`, `src/components/ArtifactCard.tsx`)
- **2026-03-01**: Fixed AddPromptModal CTA button being hidden behind mobile bottom nav — adjusted `bottom` offset and `max-h` to clear nav bar (`src/components/AddPromptModal.tsx`)
- **2026-03-01**: Multi-section prompts — new `prompt_sections` table, AddPromptModal dynamic section UI (single textarea → numbered list on 2+ sections), PromptDetailModal per-section copy buttons, drag-and-drop reordering via @dnd-kit, data migration for existing prompts (`src/hooks/usePrompts.ts`, `src/components/AddPromptModal.tsx`, `src/components/PromptDetailModal.tsx`, `src/pages/PromptsPage.tsx`, `src/components/CopyToProjectModal.tsx`)
- **2026-03-01**: Phase 5C complete — 2-step onboarding welcome tour for new users with seed data option (`src/hooks/useOnboarding.ts`, `src/components/WelcomeTour.tsx`, `src/pages/InboxPage.tsx`)
- **2026-03-01**: Phase 5A complete — added success toasts for all CRUD ops (ideas, prompts, resources) via sonner (`src/pages/InboxPage.tsx`, `src/pages/PromptsPage.tsx`, `src/pages/VaultPage.tsx`); added `updated_at` triggers for `project_tasks` and `project_missions` tables (DB migration); confirmed generate-tags and fetch-url-metadata already wired
- **2026-03-01**: Created `docs/rules.md` — project rules & decisions file (`docs/rules.md`)
- **2026-03-01**: UI polish pass — card-glass hover lift + shadow transitions, EmptyState redesign with icon container + dashed border, TagChip tracking refinement, subtle -translate-y hover on prompt/resource/landing cards, active:scale tap feedback on CTAs, cockpit tab hover state, nav link active:scale, consistent border-t opacity on prompt copy buttons (`src/index.css`, `src/components/TagChip.tsx`, `src/components/EmptyState.tsx`, `src/pages/PromptsPage.tsx`, `src/pages/VaultPage.tsx`, `src/pages/LandingPage.tsx`, `src/pages/CockpitPage.tsx`, `src/components/AppShell.tsx`)
- **2026-03-01**: Built Documentation Center at `/docs` with sidebar layout and 6 pages: Overview, Architecture, Components, Data Flow, API, Dependencies (`src/components/DocsLayout.tsx`, `src/pages/docs/*.tsx`, `src/App.tsx`)
- **2026-02-27**: Public landing page at `/` with hero section, feature highlights, and sign-up CTA (`src/pages/LandingPage.tsx`, `src/App.tsx`)
- **2026-02-27**: SEO meta tags — title, description, OG image, Twitter card, canonical URL (`index.html`, `public/images/og-image.png`)
- **2026-03-01**: XML sitemap at `/sitemap.xml` with all public routes; updated `robots.txt` with Sitemap directive (`public/sitemap.xml`, `public/robots.txt`)
- **2026-03-01**: Dark mode support — wired `next-themes` ThemeProvider, added theme picker to onboarding WelcomeTour (3 steps now), added Appearance toggle to ProfilePage, dark gradient + texture overlay, `.nav-glass`/`.mobile-nav-glass` CSS classes replacing inline styles, `color-scheme: dark` for native form/scrollbar styling (`src/App.tsx`, `src/index.css`, `src/components/WelcomeTour.tsx`, `src/pages/ProfilePage.tsx`, `src/components/AppShell.tsx`, `index.html`)
- **2026-03-01**: Community feed privacy — feed now only shows artifacts from followed users + own; added "Discover" tab for browsing all public artifacts; renamed "Recently Added" → "Feed", "Following" → "Discover" (`src/hooks/usePublicArtifacts.ts`, `src/pages/CommunityPage.tsx`)
- **2026-03-01**: Resources mobile layout overhaul — matched Community card style with aspect-video hero images, cleaner title/domain meta, hidden descriptions and tags on mobile, rounded-full search bar and pills, removed hover overlay in favor of tap-to-detail (`src/pages/VaultPage.tsx`)

### Removed

- **2026-03-01**: Dropped Phase 5D (Analytics & Insights) — tasks 5D.1 (personal stats dashboard) and 5D.2 (streak tracking) removed from roadmap; not collecting usage metrics (`docs/tasks.md`)

### Changed

- **2026-02-27**: Authenticated users now redirect to `/log` (Projects) instead of `/vault`; unauthenticated users see landing page at `/` (`src/App.tsx`, `src/pages/AuthPage.tsx`)

### Changed

- (none yet)

### Fixed

- (none yet)

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
