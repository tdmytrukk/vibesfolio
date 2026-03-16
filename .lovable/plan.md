

# Phase 5B — Search & Discovery

## What We're Building
A global search feature in the nav bar that lets users search across their ideas, prompts, and resources by title and tags, with categorized results in a command palette dropdown.

## Approach

We'll use the existing `cmdk` (Command) component already in the project to build a search command palette triggered from the nav bar. No database migration needed — we'll search client-side against already-fetched data from the existing hooks.

### Why skip DB full-text search (5B.3)?
The app fetches all user data client-side already (ideas, prompts, resources are loaded in each page's hook). A command palette filtering in-memory is faster, simpler, and avoids unnecessary DB complexity. We can revisit `tsvector` indexes later if data volumes grow.

## Tasks

### 1. Create `GlobalSearch` component
- Command palette (⌘K / Ctrl+K shortcut) using existing `CommandDialog` from `src/components/ui/command.tsx`
- Search input filters across ideas (title + tags), prompts (title + tags + summary), resources (title + tags + description)
- Results grouped by type with icons: 💡 Ideas, ✨ Prompts, 📦 Resources
- Clicking a result navigates to the relevant page and opens the detail modal (or just navigates to the page with a highlight)
- Empty state: "No results found"
- Shows max ~5 results per category

### 2. Add search trigger to AppShell nav
- Desktop: Search icon button (or small search pill) between nav items and profile avatar
- Mobile: Search icon in the top header bar
- Both open the `CommandDialog`
- Keyboard shortcut ⌘K / Ctrl+K registered globally

### 3. Create `useSearch` hook
- Accepts the query string
- Imports and calls `useIdeas`, `usePrompts`, `useResources` — but since those are page-level hooks, we'll instead create a lightweight search hook that fetches directly from Supabase with `ilike` filtering
- Returns categorized results: `{ ideas: Idea[], prompts: Prompt[], resources: Resource[] }`
- Debounced query (300ms) to avoid excessive DB calls
- Only queries when input length ≥ 2 characters

### 4. Update `docs/tasks.md`
- Mark 5B.1, 5B.2 as ✅
- Mark 5B.3 as ⏸️ (deferred — client-side search sufficient for current scale)

## Technical Details

**Search query strategy**: Use Supabase `.ilike('title', '%query%')` on each table. Also check tags array with `.contains()` or filter client-side after fetch. This avoids needing `tsvector` while still being server-side filtered.

**Navigation on select**: Each result type navigates to its page (`/ideas`, `/prompts`, `/vault`) with a query param like `?highlight=id` that the page can use to auto-open the detail modal.

**Files to create/modify**:
- `src/components/GlobalSearch.tsx` — new component
- `src/hooks/useSearch.ts` — new hook
- `src/components/AppShell.tsx` — add search trigger button + keyboard shortcut
- `docs/tasks.md` — update status

