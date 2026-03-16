

# Share vs Publish Redesign

## Current State
- `ArtifactDetailModal` exists as an in-app modal for viewing community artifacts (requires auth)
- `ShareToCommunityToggle` handles both publish + unpublish in one component
- No public-facing artifact page exists yet

## Plan

### 1. Create `PublishToggle` component (replace `ShareToCommunityToggle`)
- **Unpublished**: Button with upload icon + "Publish" label
- **Published**: Green dot + "Live" label. Clicking opens a small popover with "Unpublish" option
- Same DB logic (insert/delete `public_artifacts`)

### 2. Create `ShareButton` component
- Uses Web Share API on supported devices, otherwise shows a dropdown: Copy Link, Twitter/X, LinkedIn
- If artifact is published, link = `/shared/{artifactId}`. If not, copies the resource URL directly (for resources) or shows "Publish first to share a link" for prompts

### 3. Create `SharedArtifactPage` at `/shared/:artifactId`
- Public route (no auth required) — reuses the visual layout/styling from `ArtifactDetailModal` but as a full page
- Fetches from `public_artifacts` by ID (RLS already allows `is_public = true` for anon)
- Shows title, description, prompt content or resource link, tags, creator info, app branding with CTA to sign up

### 4. Update detail modals
- `PromptDetailModal` and `ResourceDetailModal`: replace `ShareToCommunityToggle` with `PublishToggle` + `ShareButton`

### 5. Update cards with green dot indicator
- `VaultPage` resource cards and `PromptsPage` prompt cards: show a small green dot when item is published (instead of current globe icon if any)

### 6. Route registration
- Add `/shared/:artifactId` as a public route in `App.tsx`

### Files
- **Create**: `src/components/PublishToggle.tsx`, `src/components/ShareButton.tsx`, `src/pages/SharedArtifactPage.tsx`
- **Modify**: `PromptDetailModal.tsx`, `ResourceDetailModal.tsx`, `VaultPage.tsx`, `PromptsPage.tsx`, `App.tsx`
- **Deprecate**: `ShareToCommunityToggle.tsx`

