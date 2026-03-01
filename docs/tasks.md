# Vibesfolio — Implementation Tasks

> Source of truth for implementation order. Updated as work progresses.
> Phase 1–4 are complete. This tracks Phase 5 (Polish & Growth) and beyond.

## Status Key
- ⬜ Not started
- 🔨 In progress
- ✅ Done
- ⏸️ Blocked / Deferred

---

## Phase 5A — Critical Polish (Mobile & UX Fixes)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5A.1 | Fix mobile modal Save button visibility (keyboard overlap) | ✅ | Modals use `bottom-4` + `100dvh` on mobile with sticky footer; button stays above keyboard |
| 5A.2 | Add success toasts for all CRUD operations | ✅ | Toasts on add/edit/delete for ideas, prompts, resources via sonner |
| 5A.3 | Wire `generate-tags` edge function into add flows | ✅ | Already wired in AddPromptModal; ideas/resources don't have free-form tag input |
| 5A.4 | Auto-populate resource title/description from metadata | ✅ | `handleUrlBlur` in AddResourceModal calls `fetchUrlMetadata`; auto-fills title + description |
| 5A.5 | Add `updated_at` triggers for ideas, project_tasks, project_missions | ✅ | Ideas trigger already existed; added triggers for project_tasks & project_missions |
| 5A.6 | Empty state improvements across all pages | ✅ | Added action buttons to EmptyState component; contextual CTAs on all 5 pages |
| 5A.7 | Prompts page compact grid redesign | ✅ | 3-col grid (2 on mobile), compact cards, PromptDetailModal for full view + actions |
| 5A.8 | Mobile layout optimization | ✅ | Reduced top spacing, frequency-sorted tags (2-row limit on mobile), even bottom nav spacing |

## Phase 5B — Search & Discovery

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5B.1 | Global search component in nav bar | ⬜ | Search across ideas, prompts, resources by title/tags |
| 5B.2 | Search results page or dropdown with categorized results | ⬜ | Group by type: Ideas (3), Prompts (5), Resources (2) |
| 5B.3 | Add full-text search indexes to DB tables | ⬜ | DB migration for `tsvector` columns or use textSearch |

## Phase 5C — Onboarding

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5C.1 | New user detection (first login with empty data) | ✅ | useOnboarding hook checks counts of ideas+prompts+resources; localStorage flag |
| 5C.2 | Welcome screen / guided tour | ✅ | 2-step WelcomeTour modal with Framer Motion; step 1 = core tabs, step 2 = community |
| 5C.3 | Change default landing for new users | ✅ | WelcomeTour overlays on /ideas for new users |
| 5C.4 | Seed sample data option | ✅ | "Load example data" inserts 3 ideas, 2 prompts, 2 resources |


## Multi-Section Prompts (from plan.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| MS.1 | `prompt_sections` table + RLS + data migration | ✅ | Child table with CASCADE delete; migrated existing content to single sections |
| MS.2 | `usePrompts.ts` — fetch/add/update with sections | ✅ | Joins sections on fetch; inserts/replaces on save; generates summary from concatenated content |
| MS.3 | AddPromptModal — dynamic section UI | ✅ | Single textarea for 1 section; numbered list with titles on 2+; drag-and-drop reorder via @dnd-kit |
| MS.4 | PromptDetailModal — per-section copy buttons | ✅ | Numbered section cards with individual Copy + global Copy All |
| MS.5 | PromptsPage — section count on cards | ✅ | Shows "N sections" badge on multi-section prompts |
| MS.6 | CopyToProjectModal — section-aware | ✅ | Copies concatenated sections content |

## Phase 5E — AI Enhancements

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5E.1 | AI tag suggestions on save (ideas, prompts, resources) | ⬜ | Uses existing `generate-tags` edge function + Lovable AI gateway |
| 5E.1b | AI-generated prompt summaries | ✅ | `generate-summary` edge function; summary shown on cards, full content on copy |
| 5E.2 | AI-powered prompt refinement | ⬜ | "Improve this prompt" button → AI rewrites with better structure |
| 5E.4 | Auto-categorize resources | ⬜ | AI determines tool/article/video/other from URL metadata |

## Phase 6 — Future Features

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Public builder portfolio pages | ⬜ | `/builders/:userId` — public page showing shared artifacts + build count |
| 6.2 | Curated prompt packs | ⬜ | Collections of prompts bundled as "packs" with descriptions |
| 6.3 | Export/import data | ⬜ | JSON export of all user data; import from JSON |
| 6.5 | Pro tier with gating | ✅ | Stripe integration done: 14-day trial → read-only → $5/mo or $50/yr. Edge functions: create-checkout, check-subscription, customer-portal. Gating via FAB + AppShell banner. |
| 6.6 | Prompt effectiveness tracking | ⬜ | Rate prompts after use; community sorting by effectiveness |
| 6.7 | Dark mode toggle in UI | ⬜ | CSS tokens exist; add toggle in profile/nav |
| 6.8 | Repositioning: copy update across landing, SEO, docs | ✅ | Shifted to "vibe-builders & AI learners" positioning |

---

## Deferred — Build Later

> Decision: 2026-02-27. Projects module (Build Log, Cockpit, Shipping Log, Debriefs, Missions) removed from nav & routing. Vibesfolio is focused on ideas, prompts, resources & community for now.

| # | Task | Status | Notes |
|---|------|--------|-------|
| D.1 | Build Log page & project CRUD | ⏸️ | Was `/log` — create, list, archive projects |
| D.2 | Cockpit deep-dive view | ⏸️ | Was `/log/:buildId` — missions, tasks, decisions, shipping log, debriefs |
| D.3 | Shipping Log entries | ⏸️ | Shipped / Improved / Decided / Removed / Experimented |
| D.4 | Session Debriefs | ⏸️ | End-of-session reflection: what shipped, learned, blockers |
| D.5 | Current Mission system | ⏸️ | Lock one active priority + next atomic step |
| D.6 | Build activity timeline | ⏸️ | Visual timeline of shipping log + debriefs across all projects |
| D.7 | Ideas → Builds conversion tracking | ⏸️ | Requires `source_idea_id` FK on builds table |
| D.8 | Smart next-step suggestions in Cockpit | ⏸️ | AI-based, depends on tasks + debrief data |
| D.9 | GitHub integration | ⏸️ | Link builds to repos; auto-log commits |

---

## Suggested Implementation Order

**Start with 5A (Critical Polish)** — fixes real bugs and wires up existing-but-unused features. High impact, low effort.

Then: **5B (Search)** → **5C (Onboarding)** → **5E (AI)** → **Phase 6**

---

*Last updated: 2026-03-01*
