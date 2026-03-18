# Vibesfolio — Design System & UX Guidelines

## Design Philosophy

**"Soft-focus workspace"** — The UI should feel like opening a beautiful notebook, not a corporate dashboard. Every visual decision serves calm productivity.

### Principles

1. **Calm over cluttered** — Generous whitespace, muted palettes, no visual noise
2. **Glass over solid** — Translucent, layered surfaces create depth without weight
3. **Warmth over cold** — Lavender-peach gradients instead of sterile grays
4. **Intentional motion** — Subtle fade-ups and transitions, never jarring
5. **Mobile-native** — Touch-friendly targets, bottom navigation, thumb-reachable actions

## Color System

All colors use HSL via CSS custom properties. **Never hardcode colors in components.**

### Light Mode Palette

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | 270 30% 96% | Page background (lavender-tinted) |
| `--foreground` | 240 10% 10% | Primary text (near-black) |
| `--card` | 0 0% 100% | Card surfaces |
| `--primary` | 240 8% 12% | Buttons, emphasis (charcoal) |
| `--primary-foreground` | 0 0% 98% | Text on primary |
| `--secondary` | 270 20% 94% | Secondary surfaces (light lavender) |
| `--muted` | 260 15% 93% | Muted backgrounds |
| `--muted-foreground` | 240 5% 46% | Secondary text |
| `--accent` | 20 60% 92% | Accent surfaces (warm peach) |
| `--destructive` | 0 72% 55% | Error/delete actions |
| `--border` | 260 15% 90% | Borders |

### Background Gradient

```css
--gradient-bg: linear-gradient(160deg, hsl(270 40% 92%) 0%, hsl(20 50% 93%) 50%, hsl(220 20% 94%) 100%);
```

Lavender → Peach → Cool gray diagonal sweep. Applied via `.bg-gradient-app` utility.

### Paper Texture Overlay

A subtle paper texture image at 45% opacity with `mix-blend-mode: multiply` over the gradient. Creates a handmade, tactile feel. Applied via `.bg-noise::before` pseudo-element.

### Chip Colors (Tags)

| Token | Color | Usage |
|-------|-------|-------|
| `--chip-lavender` | 270 40% 92% | Default tag |
| `--chip-peach` | 20 60% 92% | Warm category |
| `--chip-mint` | 160 40% 90% | Success/nature |
| `--chip-sky` | 210 50% 92% | Info/tech |
| `--chip-rose` | 340 40% 92% | Highlight |

### Status Colors

| Token | Color | Status |
|-------|-------|--------|
| `--status-idea` | 270 40% 88% | Idea (lavender) |
| `--status-progress` | 210 60% 86% | In Progress (blue) |
| `--status-paused` | 35 50% 88% | Paused (amber) |
| `--status-shipped` | 160 50% 86% | Shipped (green) |
| `--status-archived` | 220 10% 90% | Archived (gray) |

### Dark Mode

Full dark mode support with inverted tokens. Background shifts to `240 10% 6%`, cards to `240 10% 10%`.

## Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Headings** | DM Serif Display | 400 | h1, h2, h3 — editorial, warm serif |
| **Body** | Inter | 400/500/600 | All body text, labels, UI elements |

```css
--font-heading: 'DM Serif Display', serif;
--font-body: 'Inter', sans-serif;
```

Headings use the serif font automatically via base CSS rule. Body text uses Inter globally.

## Component Patterns

### Glass Card (`.card-glass`)

```css
background: hsl(0 0% 100% / 0.72);
backdrop-filter: blur(16px);
box-shadow: 0 2px 24px -4px hsl(240 10% 10% / 0.06);
border: 1px solid hsl(0 0% 100% / 0.6);
border-radius: var(--radius); /* 1rem */
```

Used for: Resource cards, idea cards, prompt cards, any content container.

### Liquid Glass Navigation

```css
background: linear-gradient(135deg, hsla(0,0%,100%,0.45), hsla(270,30%,96%,0.35), hsla(0,0%,100%,0.4));
backdrop-filter: blur(40px) saturate(1.8);
border: 1px solid hsla(0,0%,100%,0.3);
```

Used for: Floating top nav (desktop), bottom tab bar (mobile), FAB.

### Floating Action Button (`.fab-glass`)

Same liquid glass treatment with enhanced shadow depth. Positioned fixed, bottom-right on desktop, above bottom nav on mobile.

### Buttons

- **Primary**: `bg-primary text-primary-foreground` — charcoal pill with white text
- **Secondary**: `bg-secondary text-secondary-foreground` — light lavender
- **Destructive**: `bg-destructive text-destructive-foreground` — red
- **Ghost**: transparent with hover state
- All buttons use `rounded-full` (pill shape) or `rounded-lg`

### Tags / Chips

Small rounded pills with chip colors. Used across ideas, prompts, resources.

```tsx
<span className="bg-chip-lavender text-foreground/70 text-xs px-2 py-0.5 rounded-full">
  tag-name
</span>
```

### Modals / Dialogs

- Use shadcn `Dialog` component
- Glass-card styling on content
- Mobile: full-width with adequate padding
- Close via X button or backdrop click
- Forms inside modals use consistent label + input patterns

## Layout Patterns

### Desktop (≥768px)

- **Floating top nav**: Centered, pill-shaped, translucent. Contains logo, nav links, profile avatar.
- **Content area**: Max-width container with `px-8`, `pt-24` (below nav).
- **Grid layouts**: `grid-cols-2` to `grid-cols-4` depending on content density.

### Mobile (<768px)

- **Top bar**: Minimal — only profile avatar, right-aligned
- **Bottom tab bar**: Fixed, 5 tabs with icons + labels
- **Content area**: Full-width, `px-5`
- **Single column**: All grids collapse to `grid-cols-1`

### Navigation Structure

```
Desktop: [Logo] | [Projects] [Ideas] [Prompts] [Resources] [Community] | [Avatar ▾]
Mobile:  [Projects] [Ideas] [Prompts] [Resources] [Community]  (bottom tabs)
         [Avatar ▾]  (top right)
```

## Motion & Animation

- **Page transitions**: Fade-up on mount (`animate-fade-up`, 0.3s ease-out)
- **Card hover**: Subtle scale or shadow lift
- **Modal entry**: Fade + scale from shadcn defaults
- **Staggered lists**: Sequential fade-up with increasing delay per item
- **Library**: Framer Motion for complex animations

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.04 }}
/>
```

## Responsive Behavior

| Breakpoint | Layout |
|-----------|--------|
| < 768px (mobile) | Single column, bottom tabs, compact cards |
| 768px–1024px (tablet) | 2-column grids, top nav appears |
| > 1024px (desktop) | 3–4 column grids, full top nav, wider padding |

### Touch Targets

- Minimum 44×44px for all interactive elements on mobile
- Bottom tab icons: 20px with generous padding
- FAB: 56×56px minimum

## Accessibility

- **Color contrast**: All text meets WCAG AA (4.5:1 ratio minimum)
- **Focus states**: Visible ring on keyboard navigation (`ring` token)
- **ARIA labels**: All icon-only buttons have `aria-label`
- **Semantic HTML**: Proper heading hierarchy, nav landmarks, main content area
- **Screen readers**: Toast notifications use appropriate ARIA roles (via sonner/shadcn)

## Iconography

- **Library**: Lucide React
- **Style**: Outline icons, 1.6 stroke width (default), 2.2 for active state
- **Sizes**: 16px in nav, 20px in mobile tabs, 14px in dropdowns

## Branding

- **Name**: Vibesfolio
- **Tagline**: "Your space for ideas, prompts & resources"
- **Favicon**: Standard (public/favicon.ico)

### Logo System

The logo uses a custom SVG icon mark (dark circle with a chevron "V" and underline) paired with the "Vibesfolio" wordmark in DM Serif Display.

**Assets available:**

| File | Usage |
|------|-------|
| `vibesfolio-logo-horizontal-small.svg` | Inline nav, compact layouts |
| `vibesfolio-logo-compact.svg` | Icon-only (mobile nav, favicon-style) |
| `vibesfolio-logo-vertical.svg` | Stacked layout (auth screens, splash) |

**React Component:** `src/components/Logo.tsx`

```tsx
import Logo from "@/components/Logo";

<Logo />                          // Default: icon + text, 24px icon
<Logo size="small" />             // 20px icon, smaller text
<Logo size="large" />             // 32px icon, larger text
<Logo showText={false} />         // Icon mark only
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"small" \| "default" \| "large"` | `"default"` | Controls icon size and text scale |
| `showText` | `boolean` | `true` | Show/hide the "Vibesfolio" wordmark |
| `className` | `string` | `""` | Additional CSS classes |

**Icon mark details:**
- 32×32 viewBox, filled circle background using `currentColor`
- Chevron stroke: `hsl(var(--primary-foreground))`, 1.6px width
- Underline stroke: `hsl(var(--primary-foreground))`, 1.2px width
- Inherits text color for the circle fill, making it theme-aware (light/dark)

**Where it's used:** AppShell nav, LandingPage header, AuthPage, SharedArtifactPage, DocsLayout sidebar, App loading screen.
