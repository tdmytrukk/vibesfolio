## Plan: Hide Projects Tab & Defer to "Build Later"

The Projects module (Build Log + Cockpit) gets removed from navigation and routing. The default authenticated landing becomes `/resources`. Four areas need changes:

### 1. `src/components/AppShell.tsx` — Remove "Projects" from nav

- Remove the `{ to: "/log", label: "Projects", icon: Rocket }` entry from `navItems`
- Remove the `Rocket` import if unused elsewhere

### 2. `src/App.tsx` — Update routing

- Remove `/log` and `/log/:buildId` routes
- Remove `BuildLogPage` and `CockpitPage` imports
- Change the authenticated default redirect from `/log` to `/ideas`
- Change `PublicOnlyRoute` redirect from `/log` to `/ideas`

### 3. `src/pages/LandingPage.tsx` — Remove "Build Cockpit" feature card

- Remove the Rocket/Build Cockpit entry from the `features` array
- Adjust grid: first row 3 cards, second row 1 card (Community) centered

### 4. `docs/tasks.md` — Add "Build Later" section

- Move all Projects-related tasks (Cockpit, Build Log, Shipping Log, Debriefs, Missions) to a new "Deferred — Build Later" section
- Note the decision and date