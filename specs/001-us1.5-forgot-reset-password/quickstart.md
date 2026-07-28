# Quickstart: Validate Forgot & Reset Password

Prerequisites: `npm install` already run once. This feature works against the mock
`AuthClient` by default (no `VITE_API_BASE_URL` needed) — see `.env.example` if you
want to point at the real backend instead.

## 1. Start the dev server

```bash
npm run dev
```

## 2. Scenario: request a reset link (Acceptance Scenarios 1–2)

1. Open the app, go to `/login`, click "Forgot password?" → lands on
   `/forgot-password`.
2. Submit the demo account's email (`demo@how2prompt.dev`) → expect the same
   confirmation message as step 3.
3. Submit an email with no matching mock account (e.g. `nobody@example.com`) →
   expect an **identical** confirmation message to step 2 (no enumeration signal —
   this is the thing to actually eyeball, not just "it didn't error").

## 3. Scenario: complete a reset (Acceptance Scenario 3)

1. Navigate directly to `/reset-password?token=any-non-expired-value`.
2. Submit a new password ≥ 8 characters.
3. Expect redirect to `/login` with a success message.
4. Log in with the new password → expect success.

## 4. Scenario: expired/used link (Acceptance Scenario 4)

1. Navigate to `/reset-password?token=expired-token` (the mock's sentinel value —
   see `contracts/auth-client.md`).
2. Submit any password ≥ 8 characters.
3. Expect the "link expired, request a new one" message, with a working link back to
   `/forgot-password`.

## 5. Scenario: weak password (Acceptance Scenario 5)

1. Navigate to `/reset-password?token=any-non-expired-value`.
2. Submit a password under 8 characters.
3. Expect the same inline validation styling/message already used on
   `RegisterPage` — no request should be sent (check the network tab if testing
   against the real backend).

## 6. Automated checks

```bash
npm run lint
npm run test
npm run build
```

All three MUST pass (Constitution Principle V) before this feature is reported done.
`npm run test` should include `ForgotPasswordPage.test.tsx` and
`ResetPasswordPage.test.tsx` covering the five acceptance scenarios above.
