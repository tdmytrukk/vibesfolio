

## Changes

### 1. Reorder features in `src/pages/LandingPage.tsx`
Move Idea Inbox from first to last: Prompt Library → Resource Vault → Community → Idea Inbox.

### 2. Remove numbered step indicators in `src/components/FeatureSteps.tsx`
Replace the numbered circle (1-4) with a simple dot/bullet indicator. Keep the checkmark (✓) for visited steps — shows as a filled dot for current, muted dot for unvisited, checkmark for passed.

### 3. Shrink description text and vertically align steps to image
- Reduce description from `text-sm md:text-base` to `text-xs md:text-sm`
- Reduce step gap from `space-y-6` to `space-y-4`
- Add `justify-between` or `h-full` to the steps column so the list stretches to match the image panel height

