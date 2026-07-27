# Quickstart: Validate the Resend-Verification Fix

Prerequisites: `npm install` already run once. This feature works against the mock
`AuthClient` by default (no `VITE_API_BASE_URL` needed).

## 1. Start the dev server

```bash
npm run dev
```

## 2. Scenario: unverified login shows resend action (Acceptance Scenarios 1–2)

1. Register a new account via `/register` (mock accounts start unverified) but do NOT
   verify it.
2. Go to `/login` and log in with that account's credentials.
3. Expect login to fail and a "resend verification email" action to appear alongside
   the failure message.
4. Click the resend action → expect a confirmation message shown in place, using the
   email address already entered in the login form (no session required).

## 3. Scenario: rate-limited resend from login (Acceptance Scenario 3)

1. Immediately after step 2's resend succeeds, click the resend action again on the
   same login screen → expect a friendly "please wait" message, not a raw error.

## 4. Scenario: resend action doesn't appear for other login failures (Acceptance Scenario 4)

1. Attempt to log in with a wrong password for the demo account (`demo@how2prompt.dev`)
   or any verified account.
2. Expect the standard invalid-credentials message with NO resend action shown.

## 5. Scenario: existing in-app banner still works (User Story 2)

Since login now blocks unverified accounts (step 2 above), this state is easiest to
reach through the automated test suite rather than manual clicking:

1. Run `EmailVerificationBanner.test.tsx`, which seeds an authenticated, unverified
   session directly rather than going through the login form.
2. Confirm its existing assertions still pass unchanged: resend succeeds with a
   confirmation message and starts the cooldown countdown; a second resend within the
   cooldown window shows the rate-limited message.

## 6. Automated checks

```bash
npm run lint
npm run test
npm run build
```

All three MUST pass (Constitution Principle V) before this feature is reported done.
`npm run test` should include updated coverage in `authClient.mock.test.ts` (new
`EMAIL_NOT_VERIFIED` login branch, `resendVerificationEmail(email)`'s new signature)
and `LoginPage.test.tsx` (resend action visibility + outcomes) alongside the existing,
unchanged `EmailVerificationBanner.test.tsx` coverage.
