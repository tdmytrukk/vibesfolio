

## Problem

The category label (e.g. "inspiration") and the user-defined tags (e.g. "React", "Design") both use the same `TagChip` component with identical styling. The only difference is a slight size tweak via className overrides. This makes it hard to scan a card and distinguish metadata type from topic tags.

## Proposed Redesign

**Category** — rendered as a subtle, text-only label with an emoji or icon prefix. No background pill. Uppercase, small, muted — like a metadata label (similar to how "Resource" type badge already appears in ArtifactCard).

**Tags** — keep the existing colored `TagChip` pills. They stay as-is.

This creates a clear visual hierarchy:
```text
┌─────────────────────────┐
│  [cover image]          │
│                         │
│  Resource Title         │
│  🔗 favicon  domain.com │
│  ✨ Inspiration         │  ← category: text-only, small, with emoji
│  [React] [Design]       │  ← tags: colored pills
│  Description text...    │
└─────────────────────────┘
```

## Changes

### 1. `src/pages/VaultPage.tsx`
Replace the `<TagChip>` used for category (lines 205-208) with an inline text label that includes the category emoji:

```tsx
<span className="text-[11px] text-muted-foreground font-medium capitalize">
  {categoryEmoji} {resource.category}
</span>
```

Add a small emoji map at the top of the file:
```ts
const categoryEmoji: Record<ResourceCategory, string> = {
  inspiration: "✨",
  templates: "📐",
  tools: "🔧",
  learning: "📖",
  other: "📌",
};
```

### 2. No changes to `TagChip` component
The `TagChip` stays as-is for regular tags — it's the right treatment for those.

## Result
- Category reads as a quiet metadata label, not a tag
- Tags remain visually distinct colored pills
- Clear hierarchy without adding visual weight

