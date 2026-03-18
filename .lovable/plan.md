

# Admin Dashboard Plan

## Overview
Create a protected admin page at `/admin` that only users with the `admin` role in `user_roles` can access. The dashboard will show four sections: Feedback, Signups, Content Overview, and User Activity.

## Sections

### 1. Feedback Manager
- Table of all feedback entries (email, type, message, page_url, status, date)
- Ability to update status (new → reviewed → resolved)

### 2. Total Signups
- Count of all profiles + list view with display_name, email, created_at
- Simple growth indicator (signups this week vs last week)

### 3. Content Overview
- Aggregate counts: total prompts, resources, ideas, builds, public artifacts
- Fetched via individual count queries

### 4. User Activity & Community
- Most active users (by content count)
- Public artifacts count, follow requests pending

## Technical Approach

### New files
- **`src/pages/AdminPage.tsx`** — Main dashboard with tabs for each section. Uses `supabase` client to query tables (admin RLS policies already exist on all relevant tables). Checks `has_role` via a query to `user_roles` on mount; redirects non-admins.
- **`src/hooks/useAdminData.ts`** — Hook that fetches all admin stats (profiles count, feedback list, content counts, active users). Only runs if user has admin role.

### Route setup
- Add `/admin` route inside the `ProtectedRoute` wrapper in `App.tsx`
- Add an "Admin" link in the profile dropdown (only visible when user has admin role)

### Role check
- Query `user_roles` table where `user_id = auth.uid()` and `role = 'admin'` on page load
- If not admin, show access denied or redirect to `/ideas`

### No database changes needed
- All admin SELECT policies already exist on feedback, profiles, prompts, resources, ideas, builds, public_artifacts, and user_roles tables
- The `has_role` security definer function is already in place

### UI Design
- Consistent with existing app styling (glassmorphism, rounded cards, dark theme)
- Stats cards at top (total users, total content, pending feedback)
- Tabbed interface below for detailed views (Feedback, Users, Content, Activity)

