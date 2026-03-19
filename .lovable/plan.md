

# Create Test User Account — Implementation Plan

## Overview
Create an edge function `create-test-user` that uses the admin API to create a pre-verified test account, then invoke it to create the account.

## Steps

### 1. Create Edge Function `supabase/functions/create-test-user/index.ts`
- Admin-only (verified via `has_role` check)
- Calls `supabase.auth.admin.createUser()` with `email_confirm: true`
- Accepts `{ email, password, display_name }` in request body
- The existing `create_profile_on_signup` trigger handles profile creation automatically

### 2. Update `supabase/config.toml`
- Add `[functions.create-test-user]` with `verify_jwt = false` (auth checked in code)

### 3. Invoke the function
- Call it once from the admin page or via the deployed URL to create:
  - Email: `testtest@gmail.com`
  - Password: `TestVibes2026!`
  - Display name: `Test User`
- No admin role assigned — regular user by default
- Admins can delete via existing Admin Dashboard

### Technical Notes
- No database migration needed
- No new secrets needed (uses existing `SUPABASE_SERVICE_ROLE_KEY`)
- Edge function can remain for future test accounts

