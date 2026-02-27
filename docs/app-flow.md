# Vibesfolio — App Flow & User Journeys

## Route Map

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/auth` | AuthPage | Public | Login / Signup |
| `/reset-password` | ResetPasswordPage | Public | Password reset |
| `/` | Redirect → `/vault` | Protected | Default landing |
| `/ideas` | InboxPage | Protected | Idea inbox |
| `/prompts` | PromptsPage | Protected | Prompt library |
| `/vault` | VaultPage | Protected | Resource vault |
| `/log` | BuildLogPage | Protected | Project list |
| `/log/:buildId` | CockpitPage | Protected | Project detail |
| `/community` | CommunityPage | Protected | Public artifacts |
| `/community/builders` | BuildersPage | Protected | Builder profiles |
| `/profile` | ProfilePage | Protected | User profile & settings |
| `*` | NotFound | Protected | 404 page |

## Navigation Architecture

```
┌─────────────────────────────────────┐
│         Floating Top Nav (Desktop)   │
│  [Vibesfolio] | Projects Ideas      │
│  Prompts Resources Community | [👤] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Bottom Tab Bar (Mobile)      │
│  [🚀] [💡] [✨] [📦] [📡]          │
│  Proj  Ideas Prompts Res  Community │
└─────────────────────────────────────┘
```

Profile is accessed via avatar dropdown (both desktop and mobile).

## Primary User Journeys

### Journey 1: New User Onboarding

```
1. Land on /auth
2. Sign up with email + password
3. Receive verification email → click link
4. Redirected to /auth → login
5. Auto-profile created (DB trigger)
6. Redirected to /vault (default home)
7. Empty states guide first actions
```

**Edge cases:**
- Unverified email → shown message to check inbox
- Duplicate email → error toast
- Weak password → validation error

### Journey 2: Capture an Idea

```
1. From any page → tap FAB (+) or "Add Idea" button
2. Quick-add modal opens
3. Enter title (required), note, tags, links
4. Tap Save
5. Optimistic UI: idea appears immediately in list
6. Background: Supabase insert
7. On error: rollback optimistic update, show toast
```

**State transitions:**
- Modal: closed → open → saving → closed
- List: current → optimistic add → confirmed/rolled back

### Journey 3: Save a Resource

```
1. Navigate to /vault → tap "Add Resource"
2. Enter URL
3. Edge function fetches metadata (title, description, OG image, favicon)
4. Auto-populate title & description fields
5. User selects category, adds tags
6. Optional: upload a file attachment
7. Save → card appears in grid with OG image
```

**Edge cases:**
- Invalid URL → edge function returns error, user sees toast
- Site unreachable → fallback to manual entry (domain extracted from URL)
- No OG image → card shows without image, favicon shown instead
- File upload fails → resource saved without file, error toast

### Journey 4: Build a Project (Full Lifecycle)

```
1. /log → "New Project" → enter name, description, optional Lovable URL
2. Project card appears with "idea" status
3. Click card → /log/:buildId (Cockpit)

In Cockpit:
4. Set Mission: priority, next step, time estimate
5. Add tasks to buckets (today / next / backlog)
6. Drag tasks between buckets or mark done
7. Log decisions with context & outcome
8. Add shipping log entries as progress milestones
9. End session → fill debrief (what shipped, learned, blockers, next plan, mood)
10. Update project status: idea → progress → shipped

11. Back on /log → project card reflects new status & updated timestamp
```

**State transitions for build status:**
```
idea → progress → shipped
         ↓
       paused → progress
         ↓
       archived
```

### Journey 5: Use a Prompt

```
1. /prompts → browse or filter by tags
2. Click prompt card → view full content
3. Copy button → content copied to clipboard → toast confirmation
4. Use prompt in external tool (Lovable, ChatGPT, etc.)
5. Optional: edit prompt to refine after use
```

### Journey 6: Share to Community

```
1. From prompt or resource → "Share to Community" toggle
2. PublishArtifactModal opens
3. Fill additional metadata (description, cover image, use case)
4. Toggle "Public" on
5. Artifact appears in /community for all users
6. Other users can save it to their library
```

### Journey 7: Discover & Follow Builders

```
1. /community → browse artifacts
2. See artifact by another builder → click profile
3. /community/builders → view builder cards
4. Send follow request → pending state
5. Target user sees notification badge on avatar
6. Target approves → mutual visibility established
7. Follower can see followed builder's public artifacts
```

## Screen-by-Screen Flows

### Auth Page (`/auth`)

```
┌─────────────────────┐
│                     │
│   Vibesfolio        │
│                     │
│   [Email      ]     │
│   [Password   ]     │
│                     │
│   [  Log In   ]     │
│                     │
│   Don't have an     │
│   account? Sign up  │
│                     │
│   Forgot password?  │
└─────────────────────┘
```

Toggles between login and signup mode. Shows validation errors inline.

### Resource Vault (`/vault`)

```
┌──────────────────────────────────────────┐
│  Resources                    [+ Add]    │
│                                          │
│  [All] [Tools] [Articles] [Videos]       │
│  [tag1] [tag2] [tag3]                    │
│                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ OG   │ │ OG   │ │ OG   │ │ OG   │   │
│  │ IMG  │ │ IMG  │ │ IMG  │ │ IMG  │   │
│  │      │ │      │ │      │ │      │   │
│  │Title │ │Title │ │Title │ │Title │   │
│  │desc  │ │desc  │ │desc  │ │desc  │   │
│  │[tags]│ │[tags]│ │[tags]│ │[tags]│   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
└──────────────────────────────────────────┘
```

- Grid: 1 col mobile, 2 col sm, 3 col md, 4 col lg
- Cards show OG image, title, domain, tags
- Click card → detail modal with full info + edit/delete

### Build Log (`/log`)

```
┌──────────────────────────────────────────┐
│  Projects                   [+ New]      │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │ 🟣 Project Name          in progress│ │
│  │ Description text...                 │ │
│  │ Updated 2 hours ago                 │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ 🟢 Another Project         shipped  │ │
│  │ ...                                 │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

- Cards sorted by `updated_at` descending
- Status badge with color from status palette
- Click → navigate to `/log/:buildId`

### Cockpit (`/log/:buildId`)

```
┌──────────────────────────────────────────┐
│  ← Back    Project Name     [Status ▾]   │
│                                          │
│  ┌── Mission ──────────────────────────┐ │
│  │ Priority: Ship MVP                  │ │
│  │ Next Step: Fix mobile layout        │ │
│  │ Time: ~30 min                       │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌── Tasks ────────────────────────────┐ │
│  │ Today    │ Next     │ Backlog       │ │
│  │ □ Task1  │ □ Task4  │ □ Task7      │ │
│  │ ☑ Task2  │ □ Task5  │ □ Task8      │ │
│  │ □ Task3  │ □ Task6  │              │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌── Decisions ────────────────────────┐ │
│  │ • Used Tailwind over CSS modules    │ │
│  │ • Chose Supabase for auth           │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌── Shipping Log ─────────────────────┐ │
│  │ 📦 Auth system shipped    Feb 25    │ │
│  │ 🔧 Fixed mobile nav      Feb 24    │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌── Session Debriefs ─────────────────┐ │
│  │ [+ New Debrief]                     │ │
│  │ Feb 25 - 😊 Shipped auth, learned...│ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

Sections are collapsible. Tasks support drag-and-drop between buckets.

### Community (`/community`)

```
┌──────────────────────────────────────────┐
│  Community          [Builders →]         │
│                                          │
│  [All] [Prompts] [Resources]             │
│                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │Cover │ │Cover │ │Cover │            │
│  │      │ │      │ │      │            │
│  │Title │ │Title │ │Title │            │
│  │by @  │ │by @  │ │by @  │            │
│  │[Save]│ │[Save]│ │[Saved]│           │
│  └──────┘ └──────┘ └──────┘            │
└──────────────────────────────────────────┘
```

### Profile (`/profile`)

```
┌──────────────────────────────────────────┐
│  Profile                                 │
│                                          │
│  [Avatar]  Display Name                  │
│            email@example.com             │
│            [Public ○ / Private ●]        │
│                                          │
│  [Edit Profile]                          │
│                                          │
│  Followers (3)  Following (5)            │
│                                          │
│  Pending Requests (2)                    │
│  ┌─────────────────────────────────────┐ │
│  │ @builder1 wants to follow you       │ │
│  │ [Accept] [Decline]                  │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

## Error States

| Scenario | Behavior |
|----------|----------|
| Network offline | Toast: "You're offline. Changes will sync when reconnected." |
| Auth expired | Redirect to `/auth` via ProtectedRoute |
| 404 route | NotFound page with link back to home |
| Empty lists | EmptyState component with illustration + CTA |
| Form validation | Inline error messages below fields |
| API error on save | Optimistic rollback + error toast |
| Edge function timeout | Fallback to manual entry + warning toast |
| File upload too large | Client-side validation before upload attempt |

## Data Flow Patterns

### Optimistic Updates

All CRUD operations follow this pattern:
1. Generate optimistic state with `crypto.randomUUID()`
2. Update local state immediately
3. Send request to backend
4. On success: replace optimistic item with server response
5. On error: rollback to previous state + show toast

### Custom Hooks Pattern

Each data domain has a dedicated hook:
- `useIdeas()` — ideas CRUD + filtering
- `usePrompts()` — prompts CRUD + filtering
- `useResources()` — resources CRUD + metadata fetch
- `useBuilds()` — builds CRUD
- `useTasks()` — per-build tasks
- `useDecisions()` — per-build decisions
- `useShippingLog()` — per-build log entries
- `useDebriefs()` — per-build session debriefs
- `useMission()` — per-build focus tracking
- `useFollows()` — social graph
- `usePublicArtifacts()` — community artifacts
- `useSavedArtifacts()` — bookmarked artifacts

### Auth Flow

```
App mount → supabase.auth.getSession()
         → onAuthStateChange listener
         → ProtectedRoute checks user
         → Redirect to /auth if null
         → AuthProvider wraps all routes
```

Session persists via Supabase's built-in token refresh. No manual token management needed.
