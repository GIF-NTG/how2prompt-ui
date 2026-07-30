# Contract Amendment: `AuthClient.resendVerificationEmail` + `POST /auth/login` (docs) + `POST /auth/resend-verification` (docs)

This amends the `AuthClient` contract, most recently amended by
`specs/002-us1.6-verify-email/contracts/auth-client.md`. That contract's "single
integration point" rule and "What callers MUST NOT do" list apply unchanged to the
method changed here.

```ts
interface AuthClient {
  // ...existing methods unchanged...

  /** CHANGED: was resendVerificationEmail(accessToken: string). Public request —
   *  no Authorization header, identifies the account by email like
   *  requestPasswordReset. errorCode 'RATE_LIMITED' signals the backend's resend
   *  cooldown is still active. */
  resendVerificationEmail(email: string): Promise<ResendVerificationOutcome>
}

interface AuthContextValue {
  // ...existing session/signIn/signOut/verifyEmail unchanged...

  /** Signature unchanged; now reads session.email internally instead of
   *  session.token (see data-model.md). Still only called from UI where session
   *  is non-null (EmailVerificationBanner). */
  resendVerificationEmail(): Promise<ResendVerificationOutcome>
}
```

`ResendVerificationOutcome` is unchanged, defined in [data-model.md](../data-model.md).

## Method contracts

### `AuthClient.resendVerificationEmail(email)`

- **Given** a syntactically valid `email` and the account is not currently
  rate-limited → resolves `{ status: 'success' }`.
- **Given** the account was already sent a verification email within the backend's
  rate-limit window → resolves `{ status: 'error', errorCode: 'RATE_LIMITED', message
}` (derived from `ApiError.status === 429`) — shown as a friendly "please wait"
  message, never the raw error text, matching the existing banner's pattern.
- **Real implementation** (CHANGED): `POST /auth/resend-verification` with
  `body: { email }`, no `Authorization` header (`docs/api/openapi.yaml` now marks this
  path `security: []`, matching `/auth/forgot-password`).

### `AuthContext.resendVerificationEmail()` (unchanged signature, changed body)

- Invariant unchanged: only ever called from UI (`EmailVerificationBanner`) that
  itself only renders when `session` is non-null.
- Now forwards `session.email` instead of `session.token` to
  `AuthClient.resendVerificationEmail`.

### New call site: `LoginPage` (not an `AuthContext` method — see research.md Decision 3)

- On a failed `authClient.login(email, password)` where
  `outcome.errorCode === 'EMAIL_NOT_VERIFIED'`, `LoginPage` renders a "resend
  verification email" action.
- Activating it calls `authClient.resendVerificationEmail(trimmedEmail)` directly
  (the same `trimmedEmail` already validated and submitted for the login attempt),
  using the same `authClient` singleton `LoginPage` already imports for `login()`.
- The action's own outcome (`success` / `RATE_LIMITED` / other error) is displayed
  in place on the login screen, following the same status/error message pattern
  already used by `EmailVerificationBanner`.
- The action is not shown for any other login failure (`INVALID_CREDENTIALS`, etc.).

## Contract doc changes (`docs/api/openapi.yaml`)

### `POST /auth/resend-verification`

```yaml
/auth/resend-verification:
  post:
    tags: [Auth]
    summary: Gửi lại email xác minh
    security: [] # CHANGED — public, was implicitly bearerAuth via the global default
    requestBody: # NEW — matches /auth/forgot-password's shape
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email]
            properties:
              email: { type: string, format: email }
    responses:
      '202':
        description: Yêu cầu đã được chấp nhận, email sẽ được gửi bất đồng bộ (Accepted)
      '429':
        $ref: '#/components/responses/RateLimited'
```

### `POST /auth/login` — `401` response gains `EMAIL_NOT_VERIFIED`

The existing `401` response's example/description is extended to note
`EMAIL_NOT_VERIFIED` as a possible `error.code` alongside `INVALID_CREDENTIALS`,
since `LoginPage` now branches UI on it (research.md Decision 4). No schema/shape
change — same `ErrorResponse` envelope already documented.

## Mock implementation notes (`authClient.mock.ts`)

- `login(email, password)`: when credentials match a stored account whose
  `emailVerified` is `false`, resolve
  `{ status: 'error', errorCode: 'EMAIL_NOT_VERIFIED', message: '...' }` instead of
  the current unconditional success on password match. This makes the natural
  post-registration state (`register()` already sets `emailVerified: false`)
  reachable and testable against the mock, per Constitution Principle V.
- `resendVerificationEmail(email)`: looks the account up by the `email` argument
  directly instead of via the currently stored session, so it works with no session
  (the login-screen call site). Cooldown tracking is otherwise unchanged.

## What callers MUST NOT do (unchanged, restated for this method + `LoginPage`)

- MUST NOT call `fetch`/`apiFetch` directly from `LoginPage` or
  `EmailVerificationBanner` — go through `authClient` (directly for `LoginPage`,
  matching its existing `login()` call; via `AuthContext` for
  `EmailVerificationBanner`, unchanged).
- MUST NOT branch UI copy on anything other than `errorCode` — `message` is a
  ready-to-display string.
- `LoginPage` MUST NOT show the resend action for login failures other than
  `EMAIL_NOT_VERIFIED`.
