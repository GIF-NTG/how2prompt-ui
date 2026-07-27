# Quickstart: Validate Manage Personal Profile (US-1.7)

Prerequisites: `npm install` already run once. This feature works against the mock
`AuthClient` by default (no `VITE_API_BASE_URL` needed). Real-backend verification
is currently blocked — see plan.md's "Known live-backend caveat"
(`GET /users/me` returns 404 on the live deployment as of 2026-07-27).

## 1. Start the dev server

```bash
npm run dev
```

## 2. Scenario: view + edit profile (Acceptance Scenarios 1–2)

1. Log in via `/login` (demo account or a freshly registered one).
2. Navigate to `/profile` (via the new "Hồ sơ" link in the top bar).
3. Expect the form pre-filled with the current full name, username, bio, and
   locale.
4. Change the full name and/or locale, save.
5. Expect the change to persist (reload `/profile` and confirm), and the name in
   the top bar to update immediately without a page reload.

## 3. Scenario: duplicate username (Acceptance Scenario 3)

1. While logged in as one account, attempt to set a username already used by a
   different mock account (e.g. the seeded demo account's username, if set).
2. Expect an inline "username already in use" error under the username field,
   and confirm the full name/bio/locale you also changed in the same edit are
   still shown as entered (not reset).

## 4. Scenario: field length validation (Acceptance Scenario 4)

1. Enter a full name or username exceeding the backend's declared limit (150 /
   50 characters respectively).
2. Expect an inline validation error that blocks submission before any network
   request is sent (check the Network tab shows no `PATCH /users/me` call).

## 5. Edge case: blank username

1. Clear the username field entirely and save.
2. Expect this to succeed — `username` is nullable, an empty value is a valid
   "no username set" state, not a validation error.

## 6. Access control: redirect when logged out

1. Log out, then navigate directly to `/profile`.
2. Expect an immediate redirect to `/login` — the form never renders for a
   guest.

## 7. Access control: no false redirect on reload (real backend only)

Only meaningful against the real client (`VITE_API_BASE_URL` set) — the mock's
`restoreSession()` resolves too fast to observe the race.

1. While logged in, hard-reload the browser directly on `/profile` (not via
   in-app navigation).
2. Expect the page to briefly show nothing/a loading state, then render the
   prefilled form once the session is confirmed — it must NOT flash a redirect
   to `/login` before landing on the form.

## 8. Automated checks

```bash
npm run lint
npm run test
npm run build
```

All three MUST pass (Constitution Principle V) before this feature is reported
done. `npm run test` should include `ProfileSettingsPage.test.tsx` covering the
scenarios above.
