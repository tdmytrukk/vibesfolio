

# Simplify Action Bar in Detail Modals

## Changes

### 1. Both modals (`PromptDetailModal.tsx`, `ResourceDetailModal.tsx`) — merge to single row
- Collapse the two-row `space-y-2` layout into a single `flex` row
- Remove the Delete button entirely from the card view
- Remove text labels from Open (resource only), Copy, and Edit — keep icons only
- Add ShareButton into the same row
- Order: Copy (or Open for resources) → Copy → PublishToggle → ShareButton → spacer → Edit

### 2. `PublishToggle.tsx` — change icon from `Upload` to `Radio`
- Replace `import { Upload }` with `import { Radio }` from lucide-react
- Use `<Radio size={13} />` in the unpublished button state

### 3. Delete button visibility
- **PromptDetailModal**: Delete only appears after user clicks Edit (add it to the edit flow — since prompts use `onEdit` callback that opens an edit modal, the delete should live there)
- **ResourceDetailModal**: Delete only shows when `editing === true` (already has inline edit mode — just conditionally render delete inside that state)

### Files to modify
- `src/components/PromptDetailModal.tsx` — single row, icon-only buttons, remove delete
- `src/components/ResourceDetailModal.tsx` — single row, icon-only buttons, delete only in edit mode
- `src/components/PublishToggle.tsx` — `Upload` → `Radio` icon

