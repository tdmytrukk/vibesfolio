

## Prompts Page → Compact Grid Redesign

**Current state**: Full-width vertical list, each card shows title + tags + full content preview + expand/collapse + action bar. Very tall cards — only ~2 visible per screen.

**Resource cards for reference**: Use a `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` layout with compact cards (image/fallback + title + tags + 2-line description). Actions appear on hover/click into a detail modal.

### Proposed Design

**Layout**: `grid grid-cols-2 md:grid-cols-3 gap-3`
- 2 columns on mobile, 3 on desktop
- No cover images needed — prompts are text-first

**Card anatomy** (compact):
```text
┌──────────────────────┐
│ Title (1-2 lines)    │  ← font-medium text-sm line-clamp-2
│ ┌─────┐ ┌──────┐     │  ← tag chips (max 3 shown, +N overflow)
│ │ tag │ │ tag  │     │
│ └─────┘ └──────┘     │
│ Short description…   │  ← text-xs line-clamp-2, muted
│                      │
│ 📋 Copy    ···       │  ← minimal footer: copy + overflow menu
└──────────────────────┘
```

**Key changes**:

1. **Grid layout** replaces vertical stack — `grid grid-cols-2 md:grid-cols-3 gap-3`
2. **Remove inline expand/collapse** — tapping the card opens a detail modal instead (like resources)
3. **Truncate everything** — title `line-clamp-2`, description `line-clamp-2`, max 3 tags shown
4. **Slim action bar** — only "Copy" button visible inline; Edit, Delete, Share move to a detail modal or dropdown menu (···)
5. **Create a PromptDetailModal** — opens on card click, shows full content, all tags, and all actions (edit, delete, share, copy)
6. **Shared badge** stays as a small indicator on the card

### Implementation Steps

1. **Create `src/components/PromptDetailModal.tsx`** — full-screen/sheet modal showing complete prompt content, all tags, copy/edit/delete/share actions
2. **Rewrite prompt card markup in `PromptsPage.tsx`**:
   - Switch container to `grid grid-cols-2 md:grid-cols-3 gap-3`
   - Compact card: title (line-clamp-2) + tags (max 3) + description (line-clamp-2) + copy button
   - Card click → open detail modal
   - Remove expand/collapse state and logic
3. **Move edit/delete/share actions** into the detail modal
4. **Update `docs/tasks.md`** to track this redesign

### Technical Notes
- Reuses existing `card-glass` styling for consistency
- `PromptDetailModal` follows the same pattern as `ResourceDetailModal`
- `expandedIds` state and `toggleExpand` removed entirely
- Copy button stays inline since it's the primary action (one-tap UX)

