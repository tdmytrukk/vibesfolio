# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Initial project setup
- **2026-03-01**: Multi-section prompts — new `prompt_sections` table, AddPromptModal dynamic section UI (single textarea → numbered list on 2+ sections), PromptDetailModal per-section copy buttons, drag-and-drop reordering via @dnd-kit, data migration for existing prompts (`src/hooks/usePrompts.ts`, `src/components/AddPromptModal.tsx`, `src/components/PromptDetailModal.tsx`, `src/pages/PromptsPage.tsx`, `src/components/CopyToProjectModal.tsx`)
- **2026-03-01**: Phase 5C complete — 2-step onboarding welcome tour for new users with seed data option (`src/hooks/useOnboarding.ts`, `src/components/WelcomeTour.tsx`, `src/pages/InboxPage.tsx`)
- **2026-03-01**: Phase 5A complete — added success toasts for all CRUD ops (ideas, prompts, resources) via sonner (`src/pages/InboxPage.tsx`, `src/pages/PromptsPage.tsx`, `src/pages/VaultPage.tsx`); added `updated_at` triggers for `project_tasks` and `project_missions` tables (DB migration); confirmed generate-tags and fetch-url-metadata already wired
- **2026-03-01**: Created `docs/rules.md` — project rules & decisions file (`docs/rules.md`)
- **2026-03-01**: UI polish pass — card-glass hover lift + shadow transitions, EmptyState redesign with icon container + dashed border, TagChip tracking refinement, subtle -translate-y hover on prompt/resource/landing cards, active:scale tap feedback on CTAs, cockpit tab hover state, nav link active:scale, consistent border-t opacity on prompt copy buttons (`src/index.css`, `src/components/TagChip.tsx`, `src/components/EmptyState.tsx`, `src/pages/PromptsPage.tsx`, `src/pages/VaultPage.tsx`, `src/pages/LandingPage.tsx`, `src/pages/CockpitPage.tsx`, `src/components/AppShell.tsx`)
- **2026-03-01**: Built Documentation Center at `/docs` with sidebar layout and 6 pages: Overview, Architecture, Components, Data Flow, API, Dependencies (`src/components/DocsLayout.tsx`, `src/pages/docs/*.tsx`, `src/App.tsx`)
- **2026-02-27**: Public landing page at `/` with hero section, feature highlights, and sign-up CTA (`src/pages/LandingPage.tsx`, `src/App.tsx`)
- **2026-02-27**: SEO meta tags — title, description, OG image, Twitter card, canonical URL (`index.html`, `public/images/og-image.png`)
- **2026-03-01**: XML sitemap at `/sitemap.xml` with all public routes; updated `robots.txt` with Sitemap directive (`public/sitemap.xml`, `public/robots.txt`)

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
