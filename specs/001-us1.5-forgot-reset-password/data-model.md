# Data Model: Forgot & Reset Password

This feature adds types to `src/features/auth/api/types.ts`, alongside the existing
`Account`, `Session`, `AuthErrorCode`, `AuthOutcome`. It does not modify any existing
type.

## `PasswordResetRequestOutcome`

Returned by `AuthClient.requestPasswordReset(email)`.

```ts
export type PasswordResetRequestOutcome =
  | { status: 'success' }
  | { status: 'error'; errorCode: AuthErrorCode; message: string }
```

- **`success`**: Always returned for a well-formed email, regardless of whether an
  account exists — this is not optional per spec FR-002 (no account-enumeration
  signal) and matches `docs/api/openapi.yaml`'s `/auth/forgot-password` ("Luôn trả
  200 dù email tồn tại hay không"). There is no `session`/`accountCreated` field here
  (unlike `AuthOutcome`) because this operation never authenticates anyone.
- **`error`**: Reserved for genuine failures (network error, malformed request the
  client failed to catch, `429` rate-limit) — not for "email doesn't exist", which is
  folded into `success` per the rule above.

## `PasswordResetOutcome`

Returned by `AuthClient.resetPassword(token, newPassword)`.

```ts
export type PasswordResetOutcome =
  | { status: 'success' }
  | { status: 'error'; errorCode: AuthErrorCode | 'RESET_TOKEN_EXPIRED'; message: string }
```

- **`success`**: The password was updated; the caller (`ResetPasswordPage`) routes to
  `/login` with a success message (spec Acceptance Scenario 3). No `session` is
  returned — resetting a password does not log the user in, mirroring the existing
  `register()` precedent (`contracts/auth-client.md` from `20260724-013957-login-register-ui`)
  of not silently authenticating the user as a side effect of an account-recovery
  action.
- **`error` with `errorCode: 'RESET_TOKEN_EXPIRED'`**: A client-derived code, not a
  backend one — set when the real client's request fails with HTTP status `410` (see
  `research.md` Decision 1), since the backend contract doesn't document a specific
  `error.code` string for this case. `ResetPasswordPage` branches on this exact code
  to show the "link expired, request a new one" message (spec Acceptance Scenario
  4) instead of a generic error.
- **`error` with any other `errorCode`**: Weak-password validation (`422`) or an
  unexpected failure — shown via the same generic inline error pattern
  `LoginPage`/`RegisterPage` already use.

## `ApiError` (extended, not new)

`httpClient.ts`'s existing `ApiError` class gains one field:

```ts
export class ApiError extends Error {
  code: string
  status: number       // NEW — the HTTP response status (e.g. 410, 422, 429)
  details?: Record<string, string>
}
```

No existing field changes shape; no existing caller reads `status` today, so this is
additive only.

## Relationships

```
requestPasswordReset(email)
  → POST /auth/forgot-password  (docs/api/openapi.yaml)
  → PasswordResetRequestOutcome

resetPassword(token, newPassword)
  → POST /auth/reset-password   (docs/api/openapi.yaml)
  → PasswordResetOutcome
      (errorCode: 'RESET_TOKEN_EXPIRED' derived from ApiError.status === 410)
```

Neither operation touches `Account`, `Session`, or the existing `AuthOutcome` type —
they are deliberately separate outcome shapes because neither operation can ever
carry a `session`.
