

Giiiirl, I see the issues clearly from the screenshots and code. Here's the plan:

## Problems Identified

1. **Wasted top space on mobile**: The mobile header (line 110) has `py-4` padding just for the avatar, plus the content area adds another `pt-4` (line 142). That's ~64px of dead space before any content appears.

2. **Tags not limited**: The Prompts page renders ALL tags without any row limit (line 82-108). On mobile with many tags, this pushes content way down.

3. **Uneven bottom nav spacing**: The bottom nav uses `justify-around` with `px-3` on each item (line 146-161). The `justify-around` distributes space based on container width, but `px-3` padding on variable-width labels creates visual unevenness.

## Implementation Steps

### 1. Reduce mobile top spacing (AppShell.tsx)

- Change mobile header from `py-4` to `py-2` (line 110)
- Change content area from `pt-4` to `pt-1` on mobile (line 142): `px-5 pt-1 md:px-8 md:pt-0`

### 2. Limit tags to 2 rows on mobile (PromptsPage.tsx)

- Sort `displayTags` by frequency (count how many prompts use each tag, descending)
- On mobile, cap visible tags to ~10 (roughly 2 rows) with a "Show all" toggle
- Add `max-h` with overflow-hidden on the tag container, or use a simple slice approach:
  - Compute tag frequency from prompts data
  - Sort tags by frequency descending
  - Show first 10 tags on mobile (via `useIsMobile` hook), all on desktop
  - Add a small "+N more" button to expand if needed

### 3. Fix bottom nav even spacing (AppShell.tsx)

- Change from `justify-around` to `justify-evenly` on the bottom nav (line 146)
- Remove per-item `px-3` padding and use `flex-1 text-center` on each nav item instead, ensuring equal width distribution regardless of label length

### Files to modify:
- `src/components/AppShell.tsx` — top spacing + bottom nav fix
- `src/pages/PromptsPage.tsx` — tag limiting + frequency sorting

