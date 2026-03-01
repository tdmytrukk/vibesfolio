# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Initial project setup
- **2026-03-01**: Created `docs/rules.md` — project rules & decisions file (`docs/rules.md`)
- **2026-03-01**: Built Documentation Center at `/docs` with sidebar layout and 6 pages: Overview, Architecture, Components, Data Flow, API, Dependencies (`src/components/DocsLayout.tsx`, `src/pages/docs/*.tsx`, `src/App.tsx`)
- **2026-02-27**: Public landing page at `/` with hero section, feature highlights, and sign-up CTA (`src/pages/LandingPage.tsx`, `src/App.tsx`)
- **2026-02-27**: SEO meta tags — title, description, OG image, Twitter card, canonical URL (`index.html`, `public/images/og-image.png`)

### Changed

- **2026-02-27**: Authenticated users now redirect to `/log` (Projects) instead of `/vault`; unauthenticated users see landing page at `/` (`src/App.tsx`, `src/pages/AuthPage.tsx`)

### Changed

- (none yet)

### Fixed

- (none yet)

---

**Format for new entries:**

- **Added** for new features

- **Changed** for changes in existing functionality

- **Fixed** for bug fixes

- **Removed** for removed features

- **Security** for security improvements

**Rules:**

- Add a new entry after every completed task or group of related tasks

- Include the date, a short description, and files affected

- This is a historical log — never edit or delete past entries
