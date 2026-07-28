# Quickstart: Validate Verify Email (+ Resend)

Prerequisites: `npm install` already run once. This feature works against the mock
`AuthClient` by default (no `VITE_API_BASE_URL` needed) — see `.env.example` if you
want to point at the real backend instead.

## 1. Start the dev server

```bash
npm run dev
```

## 2. Scenario: reminder banner + resend (Acceptance Scenarios 1–2)

1. Register a new account via `/register` (new mock accounts start unverified — see
   data-model.md) and log in.
2. Expect a persistent reminder banner with a "resend email" action on any
   authenticated page.
3. Click "resend email" → expect a confirmation toast/message and the action becomes
   disabled with a visible 5-minute countdown.

## 3. Scenario: rate-limited resend (Acceptance Scenario 3)

1. Immediately after step 2 above, trigger the resend action again (e.g. via a second
   tab, or by calling it again before the countdown UI would normally allow) →
   expect a friendly "please wait" message, not a raw error.

## 4. Scenario: successful verification (Acceptance Scenario 4)

1. Navigate to `/verify-email?token=any-non-expired-value` while logged in as the
   unverified account from step 2.
2. Expect the account to be marked verified; navigate to another authenticated page →
   the reminder banner no longer appears.

## 5. Scenario: expired/used link (Acceptance Scenario 5)

1. Navigate to `/verify-email?token=expired-token` (the mock's sentinel value — see
   `contracts/auth-client.md`).
2. Expect a clear "link expired" message with a way to request a new one (routes back
   to the resend action).

## 6. Edge case: no active session

1. Log out (or open the verify link in a private/incognito window).
2. Navigate to `/verify-email?token=any-non-expired-value`.
3. Expect the verification to still succeed (the flow authenticates via the token, not
   the visitor's session) — no login prompt should block it.

## 7. Automated checks

```bash
npm run lint
npm run test
npm run build
```

All three MUST pass (Constitution Principle V) before this feature is reported done.
`npm run test` should include `VerifyEmailPage.test.tsx` and
`EmailVerificationBanner.test.tsx` covering the five acceptance scenarios above.
