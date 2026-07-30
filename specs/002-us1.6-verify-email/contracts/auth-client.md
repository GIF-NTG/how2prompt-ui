# Contract Amendment: `AuthClient` + `AuthContext` — Verify Email (+ Resend)

This amends the `AuthClient` contract, most recently amended by
`specs/001-us1.5-forgot-reset-password/contracts/auth-client.md`. That contract's
"single integration point" rule and "What callers MUST NOT do" list apply unchanged
to the two methods added here, plus the two new `AuthContext` actions.

```ts
interface AuthClient {
  // ...existing methods unchanged...

  /** errorCode 'VERIFY_TOKEN_EXPIRED' signals an expired/already-used token. */
  verifyEmail(token: string): Promise<VerifyEmailOutcome>

  /** Requires the caller's current access_token — see data-model.md. */
  resendVerificationEmail(accessToken: string): Promise<ResendVerificationOutcome>
}

interface AuthContextValue {
  // ...existing session/signIn/signOut unchanged...

  /** Reads session.token internally; only called from UI that already requires a session. */
  resendVerificationEmail(): Promise<ResendVerificationOutcome>

  /** Refreshes the held session on success, if one exists (research.md Decision 4). */
  verifyEmail(token: string): Promise<VerifyEmailOutcome>
}
```

`VerifyEmailOutcome` and `ResendVerificationOutcome` are defined in
[data-model.md](../data-model.md).

## Method contracts

### `AuthClient.verifyEmail(token)`

- **Given** a valid, unexpired `token` → resolves `{ status: 'success' }`.
- **Given** an expired or already-used `token` → resolves `{ status: 'error',
errorCode: 'VERIFY_TOKEN_EXPIRED', message }` (derived from `ApiError.status ===
410`, same mechanism as `resetPassword`'s `RESET_TOKEN_EXPIRED`).
- **Given** any other failure → resolves `{ status: 'error', errorCode, message }`
  using the backend's actual `error.code`.
- **Real implementation**: `GET /auth/verify-email?token=<token>`, per
  `docs/api/openapi.yaml` — no `Authorization` header (endpoint is `security: []`,
  the flow authenticates via the token itself, not the visitor's session).

### `AuthClient.resendVerificationEmail(accessToken)`

- **Given** a valid `accessToken` and the account is not currently rate-limited →
  resolves `{ status: 'success' }`.
- **Given** the account was already sent a verification email within the backend's
  rate-limit window → resolves `{ status: 'error', errorCode: 'RATE_LIMITED', message
}` (derived from `ApiError.status === 429`) — the UI (FR-003) shows this as a
  friendly "please wait" message, never the raw error text.
- **Real implementation**: `POST /auth/resend-verification` with
  `Authorization: Bearer <accessToken>`, no request body (contract has none).

### `AuthContext.resendVerificationEmail()`

- Invariant: only ever called from UI (`EmailVerificationBanner`) that itself only
  renders when `session` is non-null — the action reads `session.token` and forwards
  to `AuthClient.resendVerificationEmail(session.token)`. Not defensive against a null
  session, matching the existing `signOut()` action's assumption pattern.

### `AuthContext.verifyEmail(token)`

- Calls `AuthClient.verifyEmail(token)`. On `{ status: 'success' }`, if `session` is
  currently non-null in this tab, re-runs `authClient.restoreSession()` and calls
  `setSession()` with the result (picks up the backend's now-updated
  `email_verified`). Works with `session === null` too (edge case: verifying on a
  device with no active session) — in that case it's a no-op besides the refresh
  skip.
- Returns the same `VerifyEmailOutcome` the underlying `AuthClient` call produced,
  unchanged — the session refresh is a side effect, not part of the outcome contract.

## Mock implementation notes (`authClient.mock.ts`)

- `verifyEmail`: sentinel token `'expired-token'` (same convention as
  `resetPassword`) triggers the `VERIFY_TOKEN_EXPIRED` branch; any other non-empty
  token succeeds. On success, if a session is currently persisted in
  `localStorage`, the mock also flips that stored session's `emailVerified` to `true`
  and re-persists it, so a subsequent `restoreSession()` (triggered by
  `AuthContext.verifyEmail`'s refresh) picks up the change — mirroring how
  `resetPassword`'s mock updates "the matching demo account's password if one can be
  resolved."
- `resendVerificationEmail`: tracks an in-memory `lastSentAt` timestamp per mock
  session/account; a call within a short cooldown window of the previous call
  resolves the `RATE_LIMITED` branch, letting tests exercise scenario 3 without
  waiting the real 5 minutes. The exact mock window length is an implementation
  detail (not spec-mandated); it only needs to be long enough that two calls made
  back-to-back in a test hit the rate-limited branch.

## What callers MUST NOT do (unchanged, restated for these two methods + actions)

- MUST NOT call `fetch`/`apiFetch` directly from `VerifyEmailPage` or
  `EmailVerificationBanner` — go through `AuthContext` (which itself goes through
  `authClient`).
- MUST NOT branch UI copy on anything other than `errorCode` (including the new
  client-derived `VERIFY_TOKEN_EXPIRED`/`RATE_LIMITED`) — `message` is a
  ready-to-display string.
- `EmailVerificationBanner` MUST NOT read or write `Session.emailVerified` directly —
  it only renders conditionally on it and calls
  `AuthContext.resendVerificationEmail()`.
