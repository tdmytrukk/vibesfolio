

## Feedback & Support System — with Email + Admin Response

### What we're building
A feedback section on the Profile page where users submit bug reports / feedback / questions. Each submission captures the user's **real email address** (editable field, pre-filled from their account email). Submissions are saved to a `feedback` table and trigger an email notification. An admin can view all feedback and see who sent it.

### 1. Database migration

Create `feedback` table:
- `id` (uuid, PK, default `gen_random_uuid()`)
- `user_id` (uuid, not null)
- `email` (text, not null) — the contact email the user provides
- `type` (text, not null) — bug / feedback / question
- `message` (text, not null)
- `page_url` (text)
- `status` (text, default `'new'`)
- `created_at` (timestamptz, default `now()`)

RLS policies:
- Users can INSERT their own rows (`user_id = auth.uid()`)
- Users can SELECT their own rows
- Admins can SELECT all rows (via `has_role`)

### 2. Edge function: `send-feedback-email`

Receives the feedback payload (type, message, email, page_url) and sends a notification email to a configured address using `LOVABLE_API_KEY`. Will need a `FEEDBACK_EMAIL` secret for the destination.

### 3. Profile page section (`ProfilePage.tsx`)

Add a "Feedback & Support" card (matching existing card-glass style) with:
- **Email field** — pre-filled from the user's account email, editable so they can provide a preferred contact address
- **Type selector** — three pill buttons: Bug, Feedback, Question
- **Message textarea**
- **Submit button** — saves to DB + invokes edge function
- Success toast on submission

### 4. Hook: `useFeedback.ts`

- `submitFeedback(type, message, email)` — inserts into `feedback` table, calls `send-feedback-email`
- Returns `{ submitFeedback, isSubmitting }`

### 5. Documentation

Update `docs/changelog.md` with the addition.

