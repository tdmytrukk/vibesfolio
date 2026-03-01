

## Phase 5C — Onboarding (Simplified)

### What We're Building

A **2-step welcome modal** for first-time users (zero content), shown once on `/ideas`:

**Step 1 — "Welcome to Vibesfolio"**
- Brief tagline: "Capture ideas, save prompts, curate resources — all in one place."
- Visual icons for the three core tabs (Ideas, Prompts, Resources)
- One-line description of each

**Step 2 — "Discover & Connect"**
- Explain the Community tab: browse shared prompts and resources from builders you follow
- CTA buttons: **"Start empty"** or **"Load example data"**

### Files to Create

1. **`src/hooks/useOnboarding.ts`**
   - Queries `ideas`, `prompts`, `resources` counts for the current user
   - If all zero → `isNewUser = true`
   - Stores `onboarding_complete` in `localStorage` so it only shows once
   - Exposes `isNewUser`, `completeOnboarding()`, `loading`

2. **`src/components/WelcomeTour.tsx`**
   - 2-step animated modal (Framer Motion fade/slide transitions)
   - Step dots + Next/Back navigation
   - Step 2 has "Start empty" and "Load example data" buttons
   - `seedExampleData()` inserts 3 ideas, 2 prompts, 2 resources for the user
   - Calls `completeOnboarding()` on either CTA
   - Glass card design matching existing `card-glass` aesthetic

### Files to Modify

3. **`src/pages/InboxPage.tsx`** — Import `useOnboarding`, render `<WelcomeTour>` overlay when `isNewUser` is true
4. **`docs/tasks.md`** — Mark 5C.1–5C.4 as done
5. **`docs/changelog.md`** — Log the onboarding feature

### No database changes needed
We query existing tables for counts and use `localStorage` for the completion flag.

