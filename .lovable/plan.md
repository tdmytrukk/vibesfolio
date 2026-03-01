

## Problem

The community feed currently shows **all** public artifacts to **every** logged-in user. The desired behavior is that users should only see artifacts from people they follow (plus their own).

## Current Flow

`usePublicArtifacts.ts` → `fetchFeed()` queries `public_artifacts` with only `is_public = true` — no follow filtering. The follow data is fetched but only used for UI decoration, not for filtering the feed results.

## Plan

### 1. Filter the feed in `usePublicArtifacts.ts`

In `fetchFeed()`, after fetching both public artifacts and the user's follows, filter the results to only include:
- Artifacts where `user_id` is the current user (your own shared items)
- Artifacts where `user_id` is in the set of followed user IDs

This is a client-side filter applied before setting state. No database or RLS changes needed — the RLS policy correctly allows reading public artifacts, but the *app layer* should restrict the feed to followed users only.

### 2. Update the "Recently Added" tab behavior

The "all" tab in `CommunityPage.tsx` currently shows everything. After this change, it will show artifacts from followed users + self — which aligns with the "Following" tab. We may want to:
- Rename "Recently Added" to "Feed" or keep it as the single feed
- Remove the separate "Following" tab since both now show the same thing, OR
- Keep "Recently Added" as a discovery tab that still shows all public artifacts

**Recommendation**: Keep the "Following" tab as the default/only feed (showing followed + own). Optionally keep a "Discover" tab for browsing all public artifacts if you want users to be able to find new builders to follow.

### 3. Update documentation

Log the change in `docs/changelog.md` and update `docs/rules.md` with the privacy rule.

### Technical Detail

In `fetchFeed()`, after fetching `followData`, build a `followingIds` set and filter `publicData` before enrichment:

```
const allowedUserIds = new Set([user.id, ...followingIds]);
const visibleData = publicData.filter(a => allowedUserIds.has(a.user_id));
```

Then enrich only `visibleData` instead of all `publicData`.

