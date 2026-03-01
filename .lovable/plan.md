

## Create XML Sitemap at `/sitemap.xml`

### Context
This is an SPA (Vite + React Router). The sitemap needs to be a static file in `public/` so it's served at the root. There are no blog posts in the app, so we'll cover the public routes only.

### Public routes (from App.tsx)
- `/` — Landing page (priority 1.0)
- `/auth` — Sign in/up (priority 0.8)
- `/docs` — Docs home (priority 0.8)
- `/docs/architecture` — (priority 0.6)
- `/docs/components` — (priority 0.6)
- `/docs/data-flow` — (priority 0.6)
- `/docs/api` — (priority 0.6)
- `/docs/dependencies` — (priority 0.6)

All other routes (`/ideas`, `/prompts`, `/vault`, etc.) are behind `ProtectedRoute` and should not be in the sitemap.

### Changes

1. **Create `public/sitemap.xml`** — static XML sitemap with all public routes, `lastmod` set to today (2026-03-01), priorities as described above.

2. **Update `public/robots.txt`** — add `Sitemap: https://vibesfolio.lovable.app/sitemap.xml` line.

3. **Update docs** — changelog entry.

No code changes, no database changes. Two static files only.

