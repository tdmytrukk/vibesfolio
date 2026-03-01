

## Multi-Section Prompts

The user wants prompts to support multiple numbered, named sections — each independently copyable — under one shared "umbrella" title and tags. Like the screenshot reference where items 5, 6, 7, 8 each have a title, body text, and a Copy button.

### Current State
- A prompt has: `title`, `content` (single text field), `summary`, `tags`
- Database `prompts` table stores `content` as a single `text` column

### Approach: New `prompt_sections` Table

Rather than storing sections as JSON in the `content` column (fragile, hard to query), a dedicated child table is cleaner and aligns with the existing pattern (e.g., `build_notes` → `builds`).

### Database Changes

**New table: `prompt_sections`**
- `id` uuid PK
- `prompt_id` uuid FK → prompts.id ON DELETE CASCADE
- `name` text (section title, e.g. "The Magic Debug Prompt")
- `content` text (the section body)
- `position` integer (1-based order)
- `created_at` timestamptz

**RLS policies** — same pattern as `build_notes`: users can CRUD sections via ownership of the parent prompt.

**Migration for existing data**: Move every existing prompt's `content` into a single section (position=1, name = prompt title) so nothing breaks.

### Files to Modify

1. **`src/hooks/usePrompts.ts`**
   - Add `PromptSection` interface: `{ id, name, content, position }`
   - Extend `Prompt` type with `sections: PromptSection[]`
   - Fetch sections alongside prompts (join or separate query)
   - Update `addPrompt` / `updatePrompt` to handle sections array
   - Backward-compatible: if a prompt has no sections, fall back to `content` field

2. **`src/components/AddPromptModal.tsx`**
   - Replace single content textarea with a dynamic list of sections
   - Each section has: numbered label, name input, content textarea
   - "Add section" button to append new sections
   - Remove/reorder sections
   - On save: pass `sections[]` array

3. **`src/components/PromptDetailModal.tsx`**
   - Render sections as numbered cards (matching screenshot style)
   - Each section shows: number badge, bold title, body text, individual Copy button
   - Keep the global "Copy All" button that concatenates everything

4. **`src/pages/PromptsPage.tsx`**
   - Card preview: show section count (e.g. "4 sections") instead of just content preview
   - Per-card copy still copies the full concatenated content

5. **Documentation**: Update `docs/changelog.md`, `docs/tasks.md`

### Technical Details

```text
prompt_sections table:
┌──────────┬───────────┬──────────┬─────────┬──────────┐
│ id (PK)  │ prompt_id │ name     │ content │ position │
│          │ FK→prompts│          │         │          │
└──────────┴───────────┴──────────┴─────────┴──────────┘

Detail modal layout (per section):
┌─────────────────────────────────────────────┐
│  [1]  Section Title                 📋 Copy │
│                                             │
│  Section body text here...                  │
│                                             │
└─────────────────────────────────────────────┘
```

Data migration SQL:
```sql
INSERT INTO prompt_sections (prompt_id, name, content, position)
SELECT id, title, content, 1 FROM prompts WHERE content IS NOT NULL;
```

The `prompts.content` column stays for backward compatibility and summary generation — it will store the concatenated text of all sections.

