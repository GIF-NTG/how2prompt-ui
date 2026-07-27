# Contract Amendment: `AuthClient` — Forgot & Reset Password

This amends the `AuthClient` contract first established in
`specs/20260724-013957-login-register-ui/contracts/auth-client.md`. That contract's
"single integration point" rule and "What callers MUST NOT do" list apply unchanged
to the two methods added here.

```ts
interface AuthClient {
  // ...existing methods unchanged (login, register, signInWithGoogle,
  // completeGoogleOAuth, logout, restoreSession)...

  /** Always resolves 'success' for a well-formed email — see PasswordResetRequestOutcome. */
  requestPasswordReset(email: string): Promise<PasswordResetRequestOutcome>

  /** errorCode 'RESET_TOKEN_EXPIRED' signals an expired/already-used token. */
  resetPassword(token: string, newPassword: string): Promise<PasswordResetOutcome>
}
```

`PasswordResetRequestOutcome` and `PasswordResetOutcome` are defined in
[data-model.md](../data-model.md).

## Method contracts

### `requestPasswordReset(email)`

- **Given** any syntactically valid email (existing account or not) → resolves
  `{ status: 'success' }`. The mock and real implementations both do this
  unconditionally for a well-formed email — this is the whole point of FR-002
  (no account-enumeration signal), not a mock-only shortcut.
- **Given** a network/unexpected failure → resolves `{ status: 'error', errorCode,
message }` (does not reject) — callers show `message` inline, same as every other
  `AuthClient` method.
- Callers are responsible for empty/malformed-email validation _before_ calling this
  (same division of responsibility as `login`/`register`).
- **Real implementation**: `POST /auth/forgot-password` with `{ email }`, per
  `docs/api/openapi.yaml`. The endpoint always returns `200`, so in practice the
  `error` branch here is unreachable unless the request itself fails
  (network/`5xx`/`429`).

### `resetPassword(token, newPassword)`

- **Given** a valid, unexpired `token` and a `newPassword` meeting the minimum-length
  rule → resolves `{ status: 'success' }`.
- **Given** an expired or already-used `token` → resolves `{ status: 'error',
errorCode: 'RESET_TOKEN_EXPIRED', message }`. The real implementation sets this
  `errorCode` when the underlying `ApiError.status === 410` (see `research.md`
  Decision 1) — **not** from the backend's `error.code`, since the contract doesn't
  document one for this case.
- **Given** any other failure (e.g. `422` weak password the client-side check
  somehow missed) → resolves `{ status: 'error', errorCode, message }` using the
  backend's actual `error.code`.
- Callers are responsible for the same client-side password-length validation
  `RegisterPage` already performs, _before_ calling this.
- **Real implementation**: `POST /auth/reset-password` with
  `{ token, new_password }`, per `docs/api/openapi.yaml`.

## Mock implementation notes (`authClient.mock.ts`)

- `requestPasswordReset`: always resolves `{ status: 'success' }` for a well-formed
  email — no lookup against `mockAccounts` (deliberately, to mirror the real
  endpoint's no-enumeration behavior even in the mock).
- `resetPassword`: to exercise both branches without a real backend, the mock treats
  a fixed sentinel token (e.g. `'expired-token'`) as triggering the
  `RESET_TOKEN_EXPIRED` branch, and any other non-empty token as success (updating
  the matching demo account's password if one can be resolved, otherwise still
  succeeding — the mock has no real token↔account mapping since it never issued a
  real token to begin with).

## What callers MUST NOT do (unchanged, restated for these two methods)

- MUST NOT call `fetch`/`apiFetch` directly from `ForgotPasswordPage` or
  `ResetPasswordPage` — go through `authClient` only.
- MUST NOT branch UI copy on anything other than `errorCode` (including the new
  client-derived `RESET_TOKEN_EXPIRED`) — `message` is a ready-to-display string.
