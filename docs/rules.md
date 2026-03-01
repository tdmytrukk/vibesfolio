# Project Rules & Decisions

This file is the single source of truth for all project-wide decisions. Update it immediately when any decision is made.

## How to use this file

- Every architecture choice, naming convention, or design pattern we agree on goes here
- Every business rule or constraint gets documented here
- If a decision overrides a previous one, update the entry (don't duplicate)
- Group entries by category for easy scanning

---

## Architecture

- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Lovable Cloud (Supabase) — Postgres, Auth, Edge Functions, Storage
- **State management**: TanStack React Query for server state, React useState for local state
- **Routing**: React Router v6 with nested routes
- **Styling**: Tailwind semantic tokens via CSS custom properties in `index.css`. Never hardcode colors in components.
- **Glass UI**: All cards use `.card-glass`, nav uses liquid glass pattern
- **Fonts**: DM Serif Display (headings), Inter (body)

## Naming Conventions

- **Components**: PascalCase, one component per file (e.g., `AddIdeaModal.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useIdeas.ts`)
- **Pages**: PascalCase with `Page` suffix (e.g., `InboxPage.tsx`)
- **Database columns**: snake_case (e.g., `user_id`, `created_at`)
- **CSS tokens**: kebab-case with `--` prefix (e.g., `--chip-lavender`)
- **Edge functions**: kebab-case folder names (e.g., `fetch-url-metadata`)

## Design Patterns

- **Data hooks**: Each entity has a dedicated hook (`useIdeas`, `usePrompts`, etc.) that handles CRUD via Supabase SDK
- **Privacy filter**: All data hooks explicitly filter by `user_id` — never rely solely on RLS for frontend display
- **Modals for CRUD**: Add/edit/detail views use shadcn Dialog modals, not separate routes
- **Tags**: Stored as `text[]` arrays in Postgres, rendered via `TagChip` component
- **Grid layouts**: 2 cols on mobile, 3 on tablet, 4 on desktop for card grids
- **Empty states**: Use `EmptyState` component with contextual CTAs

## Business Logic

- **Auth**: Email/password only, email verification required (no auto-confirm)
- **Privacy**: Everything private by default. Community sharing is opt-in per artifact via `PublishArtifactModal`
- **Subscription**: 14-day free trial → read-only → $5/mo or $50/yr via Stripe
- **Admin role**: Admins can read all data via RLS but frontend filters to own data only
- **Builds module**: Deferred (decision 2026-02-27). Nav shows Ideas, Prompts, Resources, Community only.

## Integrations

- **Stripe**: Checkout, subscription management, customer portal via edge functions (`create-checkout`, `check-subscription`, `customer-portal`)
- **Lovable AI Gateway**: Used for `generate-tags` and `generate-summary` edge functions. No external API key needed.
- **URL Metadata**: `fetch-url-metadata` edge function for OG data extraction

---

*Last updated: 2026-03-01*
