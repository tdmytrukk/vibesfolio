

## Add Dark Mode with Theme Selection

### Context
The app already has `next-themes` installed, `.dark` CSS variables fully defined in `index.css`, and dark-mode-aware styles on `.card-glass`, `.fab-glass`, and the AppShell nav. The missing piece is wiring up `next-themes` and giving users a way to pick their theme.

### Changes

**1. Wire up ThemeProvider (`src/App.tsx`)**
- Wrap the app with `next-themes` `ThemeProvider` (attribute `class`, default `light`, storageKey `vibesfolio-theme`).

**2. Add theme selector to WelcomeTour (`src/components/WelcomeTour.tsx`)**
- Before the final "Load example data / Start empty" step, add a Step 2 (shift existing step 2 to step 3) that lets users pick Light or Dark with small preview cards. Clicking one applies `setTheme()` immediately so they see it live. Total steps: 3.

**3. Add theme toggle to Profile page (`src/pages/ProfilePage.tsx`)**
- New card section "Appearance" with Sun/Moon icons and a toggle/switch to flip between light and dark so users can change it anytime.

**4. Fix dark-mode gradient background (`src/index.css`)**
- The `--gradient-bg` variable is only defined for light mode. Add a dark override so `.bg-gradient-app` uses a dark gradient instead of the lavender-peach one.
- Reduce or disable the paper texture overlay in dark mode (`.dark .bg-noise::before { opacity: 0.08; }`) so it doesn't look washed out.

**5. Dark-mode-aware AppShell glass nav (`src/components/AppShell.tsx`)**
- The inline `glassStyle` object and mobile nav use hardcoded light `hsla(0,0%,100%,...)` values. Add a `useTheme()` hook to swap in dark glass values, or convert to CSS classes that respect `.dark`.

**6. Dark-mode auth page (`src/pages/AuthPage.tsx`)**
- Already uses `bg-gradient-app bg-noise` and `card-glass`, so it will inherit correctly once the gradient and texture are fixed. No major changes needed.

**7. Update docs**
- `docs/changelog.md` — log the dark mode addition.
- `docs/rules.md` — note that `next-themes` manages theme via `class` strategy, stored in `vibesfolio-theme` localStorage key.

### Technical Details

- **ThemeProvider config**: `attribute="class"`, `defaultTheme="light"`, `storageKey="vibesfolio-theme"`, `enableSystem={false}` (explicit user choice only).
- **Dark gradient**: `--gradient-bg` in `.dark` set to something like `linear-gradient(160deg, hsl(240 10% 8%) 0%, hsl(260 12% 10%) 50%, hsl(220 10% 9%) 100%)`.
- **AppShell glass**: Replace inline `style={glassStyle}` with a CSS utility class (e.g., `.nav-glass`) that has both light and `.dark .nav-glass` variants. This is cleaner than runtime theme checks.
- No database changes. Theme preference is stored client-side via `next-themes` localStorage.

