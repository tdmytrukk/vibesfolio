# Vibesfolio — Implementation Guide

## Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui + Framer Motion |
| **State** | TanStack React Query (server state) + React useState (local state) |
| **Routing** | React Router v6 (nested routes) |
| **Backend** | Lovable Cloud (Supabase) — Postgres DB, Auth, Edge Functions, Storage |
| **Deployment** | Lovable Cloud hosting |

### Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  React + Vite + Tailwind + shadcn           │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Pages   │ │Components│ │  Hooks   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│         │           │            │           │
│         └───────────┼────────────┘           │
│                     │                        │
│              supabase-js SDK                 │
└─────────────────────┼───────────────────────┘
                      │
┌─────────────────────┼───────────────────────┐
│              Lovable Cloud                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   Auth   │ │ Postgres │ │  Storage │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────────────────────────────────┐   │
│  │         Edge Functions               │   │
│  │  fetch-url-metadata | generate-tags  │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### `builds` — Projects
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | Auto-generated |
| user_id | uuid | Owner |
| name | text | Required |
| description | text | Optional |
| status | text | `idea` / `progress` / `paused` / `shipped` / `archived` |
| lovable_url | text | Link to Lovable project |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto-bumped via trigger |

#### `project_tasks` — Per-build task board
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| build_id | uuid FK→builds | |
| title | text | |
| bucket | text | `today` / `next` / `backlog` |
| is_done | boolean | Default false |
| position | integer | For ordering |

#### `project_missions` — Focus tracking
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| build_id | uuid FK→builds | |
| priority | text | Current focus area |
| next_step | text | Atomic next action |
| time_estimate | text | Optional |
| is_active | boolean | |

#### `decisions` — Decision vault
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| build_id | uuid FK→builds | |
| title | text | |
| context | text | Why this decision was made |
| outcome | text | Result |

#### `shipping_log` — Progress timeline
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| build_id | uuid FK→builds | |
| title | text | |
| description | text | |
| entry_type | text | `shipped` / `milestone` / `fix` / etc. |

#### `session_debriefs` — Reflection entries
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| build_id | uuid FK→builds | |
| what_shipped | text | |
| what_learned | text | |
| blockers | text | |
| next_session_plan | text | |
| mood | text | Emoji or label |

#### `build_notes` — Quick notes per build
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| build_id | uuid FK→builds | |
| text | text | |

#### `ideas` — Idea inbox
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | |
| title | text | |
| note | text | |
| tags | text[] | |
| links | text[] | |

#### `prompts` — Prompt library
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | |
| title | text | |
| content | text | The prompt body |
| tags | text[] | |

#### `resources` — Resource vault
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | |
| title | text | |
| url | text | |
| category | text | `tool` / `article` / `video` / `other` |
| description | text | |
| domain | text | Auto-extracted |
| og_title | text | Auto-fetched |
| cover_image_url | text | OG image |
| favicon_url | text | Auto-fetched |
| tags | text[] | |
| file_url | text | For uploaded files |
| file_name | text | |
| file_type | text | |

### Social / Community Tables

#### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid UNIQUE | |
| display_name | text | |
| email | text | |
| avatar_url | text | |
| is_public | boolean | Default false |

#### `public_artifacts` — Shared prompts/resources
Full schema with artifact_type, prompt fields, resource fields, tags, cover image, visibility.

#### `saved_artifacts` — Bookmarked community items
#### `follows` / `follow_requests` — Social graph with approval flow
#### `user_roles` — Admin/moderator/user role system

### RLS Policy Pattern

All tables use **restrictive** (FORCE) RLS policies:
- SELECT: `auth.uid() = user_id` (or via builds FK join)
- INSERT: `auth.uid() = user_id` (WITH CHECK)
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`
- Admin override: `has_role(auth.uid(), 'admin')`

### Edge Functions

| Function | Purpose |
|----------|---------|
| `fetch-url-metadata` | Fetches OG title, description, image, favicon from a URL. Used when saving resources. |
| `generate-tags` | AI-powered tag generation (uses Lovable AI gateway). |

### Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `resource-files` | Yes | Uploaded resource files |
| `avatars` | Yes | User profile pictures |

## Core Features & Requirements

### F1: Authentication
- Email/password signup & login
- Email verification required (no auto-confirm)
- Password reset flow
- Auto-create profile on signup (DB trigger)

### F2: Idea Inbox
- Quick-add modal with title, note, tags, links
- Tag filtering
- Detail modal with edit capability
- Delete with confirmation

### F3: Resource Vault
- Add by URL with auto-metadata fetch (edge function)
- File upload support
- Category filtering (tool, article, video, other)
- Tag filtering
- Card grid with OG images
- Detail modal

### F4: Prompt Library
- Add/edit/delete prompts
- Tag filtering
- Copy content to clipboard
- Publish to community toggle

### F5: Build Log
- Create/delete builds
- Status pipeline management
- Card list sorted by updated_at
- Navigate to Cockpit

### F6: Cockpit (Build Detail)
- Mission/focus section with priority, next step, time estimate
- Task board with today/next/backlog buckets
- Drag-and-drop task reordering
- Decision vault with context & outcome
- Shipping log timeline
- Session debrief form & history
- Build notes

### F7: Community
- Browse public artifacts
- Filter by type (prompt/resource)
- Save artifacts to personal library
- View builder profiles
- Follow/unfollow with request approval

### F8: Profile
- Edit display name & avatar
- Public/private toggle
- View followers & following
- Manage incoming follow requests

## Implementation Phases

### Phase 1 ✅ — Foundation
- [x] Auth (signup, login, password reset)
- [x] App shell with navigation
- [x] Database schema with RLS
- [x] Profile system

### Phase 2 ✅ — Core Capture
- [x] Idea inbox (CRUD + tags)
- [x] Resource vault (CRUD + metadata fetch + file upload)
- [x] Prompt library (CRUD + tags)

### Phase 3 ✅ — Build Tracking
- [x] Build log (CRUD + status)
- [x] Cockpit (mission, tasks, decisions, shipping log, debriefs)
- [x] Drag-and-drop task board

### Phase 4 ✅ — Community
- [x] Public artifacts (publish/unpublish)
- [x] Community browse & save
- [x] Follow system with requests
- [x] Builder profiles

### Phase 5 — Polish & Growth (Current)
- [ ] Mobile UX refinements
- [ ] Onboarding flow for new users
- [ ] Search across all content types
- [ ] AI-powered tag suggestions
- [ ] Analytics dashboard (personal build stats)
- [ ] Prompt effectiveness tracking
- [ ] Export/import data

### Phase 6 — Future
- [ ] AI prompt suggestions based on build context
- [ ] Public builder portfolio pages
- [ ] Curated prompt packs
- [ ] Integrations (GitHub, Notion, Lovable API)
- [ ] Pro tier with advanced features
