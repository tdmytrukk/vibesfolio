

# Community Page — Mobile-First Tightening

## Problems Identified

1. **Wasted space at top**: The "Builders" button row takes a full line, then search + tabs stack vertically with `space-y-6` gaps — too much vertical breathing room on mobile
2. **Cards too elongated**: The fallback/image area (`py-10`) is very tall, making cards feel stretched. The cover image `maxHeight: 220px` is also generous for small screens
3. **Card info is messy**: Domain line, type badge line, title, description, notes, "when to use", tags, footer — too many separate rows of tiny text, creating visual noise
4. **Page-level spacing**: `space-y-6` between sections is desktop-generous; mobile needs tighter

## Plan

### 1. `CommunityPage.tsx` — Tighten mobile layout (desktop unchanged)

- Move "Builders" button inline with the search/tabs row on mobile instead of its own row — use `flex` to place it next to tabs
- Reduce `space-y-6` to `space-y-3 md:space-y-6` on the outer container
- Reduce masonry gap on mobile: `gap-2 sm:gap-4`
- Reduce space between cards: `space-y-2 sm:space-y-4`

### 2. `ArtifactCard.tsx` — Compact resource cards on mobile

**Resource card image area:**
- Reduce fallback (no-image) padding from `py-10` to `py-6` on mobile via responsive classes (`py-6 sm:py-10`)
- Cap cover image max-height lower on mobile (150px vs 220px) — use a CSS class approach or responsive inline style
- Make favicon in fallback smaller on mobile (`w-8 h-8` vs `w-10 h-10`)

**Resource card info area:**
- Reduce padding from `p-4` to `p-3 sm:p-4`
- Combine the domain line and type badge line into a single row on mobile to save vertical space (e.g., `favicon + domain · RESOURCE · 🔧 Tools` all on one line)
- Hide `resource_note` and `resource_when_to_use` on mobile (these secondary details make cards too long) — use `hidden sm:block`
- Limit tags to 2 on mobile (currently unlimited for resources, 3 for prompts)
- Tighten footer: reduce avatar size, reduce button padding

**Prompt card:**
- Already compact, minor tweaks: reduce `p-4` to `p-3 sm:p-4`

### 3. No desktop changes

All modifications use responsive prefixes (`sm:`, `md:`) so desktop layout remains identical. The `sm:` breakpoint (640px) gates the mobile-specific compacting.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/CommunityPage.tsx` | Tighter spacing, inline Builders button on mobile |
| `src/components/ArtifactCard.tsx` | Compact card layout for mobile screens |
| `docs/changelog.md` | Log the change |

