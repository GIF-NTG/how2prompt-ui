# Phase 1 Data Model: Verify Email (+ Resend)

## Modified: `Session` (`src/features/auth/api/types.ts`)

```ts
export interface Session {
  accountId: string
  displayName: string
  email: string
  token: string
  issuedAt: number
  expiresAt: number
  emailVerified: boolean // NEW — see research.md Decision 1
}
```

- Populated on every `Session`-producing path: `login`, `register`'s discarded tokens
  (n/a — register never signs in), `signInWithGoogle`, `completeGoogleOAuth`,
  `restoreSession`.
- Mock: `MockAccountRecord` gains `emailVerified: boolean` (default `false` for newly
  registered accounts; the seeded demo account starts `true` so existing
  login/demo-flow tests and the mockup's default state are unaffected).

## New: `VerifyEmailOutcome` (`src/features/auth/api/types.ts`)

```ts
export type VerifyEmailOutcome =
  | { status: 'success' }
  | { status: 'error'; errorCode: AuthErrorCode | 'VERIFY_TOKEN_EXPIRED'; message: string }
```

- Never carries a session — verifying doesn't authenticate the visitor (mirrors
  `PasswordResetOutcome`'s precedent).
- `'VERIFY_TOKEN_EXPIRED'` is client-derived from `ApiError.status === 410`, not a
  backend `error.code` (see research.md Decision 3), same convention as
  `'RESET_TOKEN_EXPIRED'`.

## New: `ResendVerificationOutcome` (`src/features/auth/api/types.ts`)

```ts
export type ResendVerificationOutcome =
  | { status: 'success' }
  | { status: 'error'; errorCode: AuthErrorCode | 'RATE_LIMITED'; message: string }
```

- `'RATE_LIMITED'` is client-derived from `ApiError.status === 429`, surfaced as the
  friendly "please wait" copy required by FR-003 — not the backend's raw
  `error.message` (which the contract doesn't standardize the shape of for `429`s).

## New: `AuthContext` actions (`src/features/auth/context/AuthContext.tsx` / `AuthProvider.tsx`)

```ts
interface AuthContextValue {
  session: Session | null
  isRestoring: boolean
  signIn(session: Session): void
  signOut(): Promise<void>
  resendVerificationEmail(): Promise<ResendVerificationOutcome> // NEW
  verifyEmail(token: string): Promise<VerifyEmailOutcome> // NEW
}
```

- `resendVerificationEmail()`: reads `session.token` internally (throws/no-ops if
  called with no session — the banner that calls it only renders when a session
  exists, so this is an invariant, not a case the UI needs to handle) and forwards to
  `authClient.resendVerificationEmail(session.token)`.
- `verifyEmail(token)`: forwards to `authClient.verifyEmail(token)`; on success, if a
  `session` is currently held, re-runs `authClient.restoreSession()` and updates it
  (research.md Decision 4). Works whether or not a session exists (edge case: link
  opened on a device with no active session).

## Key Entity: Email Verification State

- A boolean per user account (`email_verified` in `UserProfile`, mirrored as
  `Session.emailVerified` client-side), changed via a single-use link token
  (`GET /auth/verify-email?token=...`). No client-side persistence of the token
  itself beyond the URL query string for the lifetime of the verify page (same
  pattern as `001-us1.5-forgot-reset-password`'s reset token).
