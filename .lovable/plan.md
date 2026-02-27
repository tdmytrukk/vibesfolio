

## Change Password → Modal with Old Password Verification

### What changes

1. **Replace inline password form with a button** — In the profile page's two-column grid, the "Change Password" card will show just an icon, title, description, and a "Change Password" button (no input fields visible).

2. **Create a `ChangePasswordModal` component** — A Dialog modal with three fields:
   - Current password (required)
   - New password (required, min 6 chars)
   - Confirm new password (required, must match)

3. **Old password verification flow** — Supabase doesn't have a direct "verify old password" API. The approach:
   - Re-authenticate the user by calling `supabase.auth.signInWithPassword({ email, password: oldPassword })` with their current email + the old password they entered.
   - If it succeeds, proceed with `supabase.auth.updateUser({ password: newPassword })`.
   - If it fails, show "Current password is incorrect."

4. **Clean up ProfilePage state** — Remove `newPassword`, `confirmPassword`, `passwordLoading`, and `handleChangePassword` from ProfilePage since all that logic moves into the modal.

### Files affected
- **`src/components/ChangePasswordModal.tsx`** — New modal component with all three fields + verification logic
- **`src/pages/ProfilePage.tsx`** — Replace the form section with a button that opens the modal; remove password-related state

### Technical detail
The old-password check uses `signInWithPassword` which re-validates credentials without disrupting the current session. On success, `updateUser` sets the new password. Both calls use the existing Supabase client.

