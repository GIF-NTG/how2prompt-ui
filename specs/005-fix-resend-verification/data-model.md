# Phase 1 Data Model: Fix Resend-Verification Contract & Add Login-Screen Resend Action

## Modified: `AuthClient.resendVerificationEmail` (`src/features/auth/api/authClient.types.ts`)

```ts
interface AuthClient {
  /**
   * Public request — no Authorization header. Always identifies the target
   * account by email, matching requestPasswordReset's shape.
   * errorCode: 'RATE_LIMITED' signals the backend's resend cooldown is still active.
   */
  resendVerificationEmail(email: string): Promise<ResendVerificationOutcome> // CHANGED from (accessToken: string)
}
```

- `ResendVerificationOutcome` (`src/features/auth/api/types.ts`) is unchanged —
  `{ status: 'success' } | { status: 'error'; errorCode: AuthErrorCode | 'RATE_LIMITED'; message: string }`.
- No account-enumeration signal is required (unlike `requestPasswordReset`, the spec
  doesn't call this out, but the real endpoint's behavior on an unknown email is out
  of scope here — the frontend forwards whatever outcome the backend returns).

## Modified: `AuthContext.resendVerificationEmail` (`AuthProvider.tsx`)

```ts
interface AuthContextValue {
  resendVerificationEmail(): Promise<ResendVerificationOutcome> // signature unchanged
}
```

- Implementation changes from `authClient.resendVerificationEmail(session!.token)` to
  `authClient.resendVerificationEmail(session!.email)` — same invariant as before
  (only ever called from UI where `session` is non-null, i.e.
  `EmailVerificationBanner`), no observable change to callers.

## No change: `ResendVerificationOutcome`, `Session`, `AuthErrorCode`

- `AuthErrorCode` is already `'INVALID_CREDENTIALS' | 'EMAIL_ALREADY_EXISTS' |
'VALIDATION_ERROR' | (string & {})` — the open string union already admits
  `'EMAIL_NOT_VERIFIED'` as a value without a type edit.
- `Session.email` already exists and is what the new login-screen logic and the
  updated `AuthContext.resendVerificationEmail()` both rely on.

## Modified: `docs/api/openapi.yaml`

- `POST /auth/resend-verification`: add `security: []`; add a `requestBody` identical
  in shape to `/auth/forgot-password`'s (`{ email: string }`, required).
- `POST /auth/login`'s `401` response: add `EMAIL_NOT_VERIFIED` alongside the already
  documented `INVALID_CREDENTIALS` as a possible `error.code` value, since the new
  frontend logic (Decision 4, research.md) now depends on it being a stable contract
  value, not an incidentally observed one.

## Modified: mock account behavior (`authClient.mock.ts`)

- `MockAccountRecord` is unchanged (already has `emailVerified: boolean`).
- `login(email, password)`: when credentials match a stored account whose
  `emailVerified` is `false`, resolve
  `{ status: 'error', errorCode: 'EMAIL_NOT_VERIFIED', message: '...' }` instead of the
  current unconditional success. Verified accounts (including the seeded demo account)
  are unaffected.
- `resendVerificationEmail(email)`: looks up the account by the given `email` argument
  directly (previously it derived the account from the currently stored session).
  Cooldown tracking (`lastVerificationSentAt`, `MOCK_RESEND_COOLDOWN_MS`) is unchanged.

## Key Entity: Verification email request

- A request tied to a single email address, not a session or access token. Its
  outcome is one of: accepted (a new verification email will be sent, subject to the
  backend's own delivery/enumeration policy), rate-limited (a prior request is still
  in its cooldown window), or a generic failure. This replaces the previous
  session-bound framing ("resend for the currently authenticated account") with an
  email-bound one that also works with no session at all.
