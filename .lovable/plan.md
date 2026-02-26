

## Plan: Convert desktop sidebar to floating top navigation bar

### What changes
Replace the fixed left sidebar on desktop with a floating horizontal navigation bar at the top of the page, using the same liquid-glass translucent style. Mobile bottom tabs stay unchanged.

### Implementation steps

1. **Rewrite `src/components/AppShell.tsx`** — Remove the `<aside>` sidebar entirely. Add a new desktop `<header>` that is:
   - Fixed at the top, horizontally centered with `max-w-fit`, slight top margin (~16px)
   - Uses the liquid-glass effect (blur 40px, saturate 1.8, translucent white gradient, subtle border + shadow)
   - Rounded pill shape (`rounded-full`)
   - Contains: "Vibesfolio" brand text on the left, nav items as horizontal icon+label pills in the center, and profile avatar dropdown + sign-out on the right
   - Hidden on mobile (`hidden md:flex`)

2. **Update main content padding** — Change `md:pl-56` to `md:pt-24 md:pl-0` so content flows below the floating top bar instead of beside the sidebar.

3. **Active state styling** — Active nav item gets a subtle filled background (`bg-white/50` or `bg-secondary`) inside the pill bar. Inactive items are muted text with hover transition.

4. **Profile/sign-out** — Move the avatar dropdown (currently mobile-only) to also show on desktop inside the top bar, replacing the sidebar sign-out button.

### Technical details

- The `<aside>` block (lines 31-68) is fully removed
- A new `<header>` is added with `fixed top-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex` positioning
- Inline `style` prop carries the glass effect (matching existing pattern from sidebar/bottom nav)
- `md:pl-56` on `<main>` becomes `md:pl-0 md:pt-24`
- Mobile header and bottom tabs remain untouched
- No new dependencies needed

