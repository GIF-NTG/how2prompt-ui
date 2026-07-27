# Quickstart: Validate Auth API Contract Migration (v1.1.0)

Prerequisites: `npm install` already run once. This migration's behavioral surface
(register/login/refresh/logout, Google sign-in, forgot/reset password, verify email,
resend verification) is exercised the same way whether backed by the mock `AuthClient`
(default, no `VITE_API_BASE_URL`) or the real one (set `VITE_API_BASE_URL` to a backend
actually running v1.1.0 — see `.env.example`). Section 8 below is real-backend-only.

## 1. Start the dev server

```bash
npm run dev
```

## 2. Scenario: register → login → session persists (US1, Acceptance 1–2)

1. Register a new account via `/register`.
2. Log in with that account's credentials on `/login`.
3. Expect the same authenticated landing screen as before this migration — no console
   errors, no "undefined" fields rendered anywhere a name/email would show.

## 3. Scenario: silent refresh keeps the session alive (US1, Acceptance 3)

1. While signed in, leave the tab open past the point `AuthProvider`'s scheduled
   refresh would fire (real backend: ~14 minutes before the 15-minute `accessToken`
   expires; mock: session is long-lived, refresh is a harmless no-op re-read).
2. Expect no forced logout and no visible error — the session simply continues.

## 4. Scenario: reset-password link already used/expired (US1, Acceptance 4)

1. Request a password reset via `/forgot-password`.
2. Use the reset link once successfully, then try the same link again (or use the
   mock's `expired-token` sentinel directly at `/reset-password?token=expired-token`).
3. Expect the same "link expired or already used" message as before this migration.

## 5. Scenario: Google sign-in, single-step (US2, Acceptance 1)

1. From `/login`, choose "Sign in with Google" and complete the picker/consent.
2. Expect to land signed-in **without** being routed through a separate callback page
   — the whole flow should feel like one step, not two.

## 6. Scenario: Google sign-in failure has no dead route (US2, Acceptance 2)

1. Trigger a Google sign-in failure (decline consent, or use whatever the mock's
   `simulate: 'cancel'` path exercises).
2. Expect a clear error with a way to retry from `/login`.
3. Separately, navigate directly to `/auth/google/callback` in the address bar.
4. Expect an immediate redirect to `/login` — not a blank page, not a console error
   (spec Clarifications Q1).

## 7. Scenario: verify email + resend (US3, Acceptance 1–3)

1. Register a new (unverified) account and log in.
2. Expect the persistent verification-reminder banner.
3. Navigate to `/verify-email?token=<a-valid-token>` (mock: any non-`expired-token`
   value) → expect the account marked verified and the banner to disappear on the next
   authenticated page.
4. Separately, with a fresh unverified account, click "resend" on the banner → expect
   confirmation that the request was accepted (not wording implying it was already
   delivered), then click it again immediately → expect the existing rate-limited
   "please wait" message.
5. Navigate to `/verify-email?token=expired-token` (mock sentinel) → expect the same
   "link expired or already used" message as the reset-password case in Section 4.

## 8. Real-backend-only: confirm the envelope/field-naming assumptions

Only runnable with `VITE_API_BASE_URL` pointed at a live v1.1.0 backend (research.md
Decisions 1–2 are inferred from the OpenAPI doc, not yet observed on the wire):

1. Open the browser's Network tab, perform a login.
2. Confirm the raw response body is `{ "data": { "accessToken": ..., "expiresIn": ... },
   "meta": ... }` (or, if the backend does *not* actually wrap it, revisit research.md
   Decision 2 and adjust `httpClient.ts`'s unwrapping accordingly — this is the one
   assumption in this migration not independently verifiable from the spec doc alone).
3. Confirm a subsequent `GET /users/me` call fires automatically and its response
   supplies `fullName`/`emailVerified` onto the resulting session.

## 9. Automated checks

```bash
npm run lint
npm run test
npm run build
```

All three MUST pass (Constitution Principle V) before this feature is reported done.
`npm run test` should continue passing unmodified in intent for every existing auth
test file (`AuthContext.test.tsx`, `LoginPage.test.tsx`, `RegisterPage.test.tsx`,
`ForgotPasswordPage.test.tsx`, `ResetPasswordPage.test.tsx`, `VerifyEmailPage.test.tsx`,
`EmailVerificationBanner.test.tsx`) — these run against the mock client, so a passing
suite alone does not substitute for Section 8's real-backend check.
