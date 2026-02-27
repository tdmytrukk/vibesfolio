# Vibesfolio — Master Plan

## Vision

Vibesfolio is **a space for vibe-builders and AI learners** to capture ideas, save prompts, and curate resources that help you build products and learn AI better. It's a calm, beautiful workspace where everything you need to grow as a builder lives in one place.

## Core Purpose

Vibe-builders and AI learners collect ideas, prompts, tutorials, and tools across scattered tabs, chats, and bookmarks. Vibesfolio brings it all together — a single space to capture what inspires you, save what works, and organize the resources that make you a better builder.

## Target Users

| Persona | Description | Pain Points |
|---------|-------------|-------------|
| **Vibe-Coder** | Builds with AI prompts as primary workflow using tools like Lovable, Cursor, Replit | Reuses prompts but can't find old ones; no prompt library; no way to share what works |
| **AI Learner** | Exploring AI tools, collecting tutorials and resources to level up | Bookmarks scattered everywhere; no organized space for learning materials |
| **Indie Builder** | Ships solo products, manages ideas and side projects | Loses track of ideas; context-switches between too many tabs; needs lightweight tracking |

## Value Proposition

> "Your space for ideas, prompts & resources — capture what inspires you, save what works, and build better with AI."

**Key differentiators:**
- **Built for builders** — not a PM tool, not a note app. Purpose-built for people who build with AI.
- **Aesthetic-first** — the UI itself reduces stress (soft gradients, glass effects, paper texture).
- **Core trio** — Ideas, Prompts, and Resources as first-class citizens, not afterthoughts.
- **Community layer** — share artifacts (prompts, resources) publicly; follow other builders.

## Primary Value Loop

```
Capture idea → Collect resources → Save prompts → Start build →
Track progress (tasks, decisions, shipping log) → Reflect (session debriefs) →
Ship → Share artifacts → Repeat
```

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Weekly active builders** | Steady growth month-over-month | Users who log in and perform ≥1 action per week |
| **Ideas → Builds conversion** | >20% of ideas become active builds | Count of builds created from idea references |
| **Session debrief completion** | >30% of active sessions end with a debrief | Debriefs created vs. active build sessions |
| **Prompt library depth** | Avg 10+ prompts per active user | Prompts saved per user |
| **Community engagement** | >15% of users share ≥1 artifact publicly | Public artifacts / total users |
| **Retention (D7)** | >40% | Users returning within 7 days of signup |

## Product Principles

1. **Calm over busy** — Every screen should feel manageable. No notification overload.
2. **Capture is king** — Adding an idea, prompt, or resource must take <10 seconds.
3. **Reflection drives growth** — Session debriefs and shipping logs aren't optional overhead; they're the product's secret weapon.
4. **Beautiful by default** — The workspace aesthetic is a feature, not decoration.
5. **Privacy first, sharing optional** — Everything is private by default; community sharing is opt-in per artifact.

## Feature Pillars

### 1. Idea Inbox
Quick-capture for raw ideas with tags, notes, and links. Zero-friction entry point.

### 2. Resource Vault
Bookmark links with auto-fetched metadata (title, description, favicon, OG image). Categorize and tag for retrieval. File uploads supported.

### 3. Prompt Library
Store, tag, and retrieve AI prompts. Copy-to-clipboard workflow. Publishable to community.

### 4. Build Log (Projects)
Lightweight project tracking: status pipeline (idea → in progress → paused → shipped → archived), Lovable URL linking, project-level tasks, decisions, shipping log, and session debriefs.

### 5. Cockpit (Build Detail)
Per-project command center: mission/focus area, task board (today/next/backlog), decision vault, shipping log timeline, and session debrief history.

### 6. Community
Browse public artifacts (prompts & resources) shared by other builders. Save artifacts to your own library. Follow builders.

### 7. Profile
Public/private toggle, display name, avatar. Manage followers and following.

## Revenue Model (Future)

- **Free tier** — Core features, limited community visibility
- **Pro tier** — Unlimited artifacts, advanced analytics, AI-powered prompt suggestions, priority community features
- **Marketplace** — Curated prompt packs and resource collections (creator revenue share)

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Users don't return after initial capture | Session debriefs and "what's next" nudges create return loops |
| Community becomes low-quality | Moderation via admin/moderator roles (already in DB schema) |
| Feature creep toward PM tools | Strict adherence to "built for one person" principle |
| Mobile experience friction | Glass UI tested on mobile; bottom-tab navigation; mobile-first modals |
