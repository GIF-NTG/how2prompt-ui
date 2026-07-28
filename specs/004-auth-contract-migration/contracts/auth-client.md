# Contract Amendment: `AuthClient` real-implementation wire mapping — v1.1.0 migration

This amends the internal wire behavior of `authClient.real.ts` and `httpClient.ts`
against `docs/api/openapi.yaml` v1.1.0, most recently amended by
`specs/002-us1.6-verify-email/contracts/auth-client.md`. Unlike that amendment, **the
public `AuthClient` interface itself does not change** — see research.md Decision 4.
This document exists to pin down the wire-level contract precisely, since the
interface staying stable is exactly what makes this a low-risk migration.

```ts
// AuthClient (src/features/auth/api/authClient.types.ts) — UNCHANGED
interface AuthClient {
  login(email: string, password: string): Promise<AuthOutcome>
  register(displayName: string, email: string, password: string): Promise<AuthOutcome>
  signInWithGoogle(options?: GoogleSignInOptions): Promise<AuthOutcome>
  // completeGoogleOAuth is REMOVED — see below
  logout(): Promise<void>
  requestPasswordReset(email: string): Promise<PasswordResetRequestOutcome>
  resetPassword(token: string, newPassword: string): Promise<PasswordResetOutcome>
  verifyEmail(token: string): Promise<VerifyEmailOutcome>
  resendVerificationEmail(accessToken: string): Promise<ResendVerificationOutcome>
  restoreSession(): Promise<Session | null>
}
```

## Removed: `AuthClient.completeGoogleOAuth(code, state)`

- Existed only to finish the authorization-code + redirect flow. The v1.1.0 contract
  has no `/auth/oauth/google/callback` endpoint at all, so this method has nothing to
  call — deleted, along with `GoogleCallbackPage.tsx` (its only caller) and the
  `authorization_url`/`state` sessionStorage bookkeeping in `authClient.real.ts`.
- The mock client never implemented a meaningful version of this (it always resolved
  with an error, per the existing doc comment) — that stub is deleted too, since
  nothing calls it anymore.

## Changed (internals only, signature stable): `AuthClient.signInWithGoogle(options?)`

- **Real implementation, before**: `GET /auth/oauth/google` → `window.location.href =
  authorization_url` (navigates away, promise never settles) → user comes back via
  `GoogleCallbackPage` → `completeGoogleOAuth`.
- **Real implementation, after**: obtains a Google ID token client-side via
  `googleIdentity.ts` (the same GIS integration the mock already uses), then
  `POST /auth/oauth/google { idToken }`, `security: []`. Resolves in-place — no
  redirect, no separate callback step.
  - **Given** the visitor completes the Google consent prompt → resolves
    `{ status: 'success', session, accountCreated: false }` (the contract doesn't
    report new-vs-existing account for this flow, same limitation the old flow already
    had — unchanged from before).
  - **Given** Google itself declines to show the prompt or the visitor cancels →
    resolves the existing `GoogleSignInOptions.simulate === 'cancel'`-equivalent error
    outcome the mock already models; the real client surfaces `googleIdentity.ts`'s
    thrown error message as `{ status: 'error', errorCode: 'VALIDATION_ERROR', message
    }`.
  - **Given** the backend rejects the token (`401`) or Google's own verification fails
    (`502`) → resolves `{ status: 'error', errorCode, message }` from the backend's
    `ErrorResponse` (or a fallback message for the undocumented `502` case).

## Changed (internals only, signature stable): `AuthClient.login`, `restoreSession`

- Both now perform `AuthResponse` (`POST /auth/login` / `POST /auth/refresh`)
  **followed by** `GET /users/me` with the resulting `accessToken`, and build `Session`
  from the combination (data-model.md "Assembly: Session"). `restoreSession()` already
  does this today for the refresh case; `login()` gains the same second call.
- Outcome contracts (`AuthOutcome`, success/error shapes) are unchanged.

## Changed (internals only, signature stable): `AuthClient.verifyEmail(token)`

- **Real implementation, before**: `GET /auth/verify-email?token=<token>`.
- **Real implementation, after**: `POST /auth/verify-email` with body `{ token }`,
  `security: []`.
- Outcome contract unchanged: success → `{ status: 'success' }`; `error.status === 410`
  → `{ status: 'error', errorCode: 'VERIFY_TOKEN_EXPIRED', message }` (still
  client-derived from the HTTP status, not a body code — research.md Decision 4); any
  other failure → the backend's actual `error.code`/`message`.

## Changed (internals only, signature stable): `AuthClient.resendVerificationEmail(accessToken)`

- **Real implementation, before**: treated `200` as success.
- **Real implementation, after**: treats `202` as success (`POST /auth/resend-verification`
  now documents `202 Accepted` — "yêu cầu đã được chấp nhận, email sẽ được gửi bất đồng
  bộ"). `apiFetch` doesn't special-case status codes for success (anything in the `ok`
  range already resolves), so this requires no branching change — only the JSDoc/UI
  copy implication that "success" means "queued," not "sent," which the caller
  (`EmailVerificationBanner`) already phrases generically enough not to need a wording
  change (see spec Assumptions: "no new screens/copy... beyond what FR-005 requires").
- `error.status === 429` → `{ status: 'error', errorCode: 'RATE_LIMITED', message }`,
  unchanged.

## Changed (internals only, signature stable): `AuthClient.resetPassword(token, newPassword)`

- **Real implementation, before**: request body `{ token, new_password }`.
- **Real implementation, after**: request body `{ token, newPassword }`. Outcome
  contract (including the `410` → `RESET_TOKEN_EXPIRED` derivation) unchanged.

## Unchanged: `AuthClient.register`, `requestPasswordReset`, `logout`

- `register`'s request body field renames from `full_name` → `fullName`
  (data-model.md), but the method's signature and `AuthOutcome` contract are unchanged
  (still discards any tokens, still never signs the visitor in).
- `requestPasswordReset`, `logout` have no field-name changes at all (their request/response
  bodies were already free of snake_case fields, or have none).

## `httpClient.ts` — internal changes

- `ApiErrorBody.error.trace_id` → `traceId` (data-model.md "ErrorResponse"). `ApiError`'s
  public fields (`code`, `message`, `status`, `details`) are unchanged — no caller
  outside `httpClient.ts` reads `traceId`/`trace_id` today, so this is a self-contained
  rename.
- `apiFetch<T>` unwraps the `{ data, meta }` envelope (research.md Decision 2) before
  returning `T` to callers — every existing call site's generic type parameter (e.g.
  `apiFetch<AuthResponseBody>`) continues to describe the *unwrapped* payload shape, no
  call site changes its type argument.

## Mock implementation notes (`authClient.mock.ts`)

- No changes required beyond continuing to satisfy the (unchanged) `AuthClient`
  interface — see research.md Decision 6. Its Google sign-in mock already calls
  `requestGoogleCredential()` directly and was never coupled to the
  authorization-code/callback flow.

## What callers MUST NOT do (unchanged, restated)

- MUST NOT call `fetch`/`apiFetch` directly from any page/component — go through
  `authClient` (via `AuthContext` where one exists, e.g. `resendVerificationEmail`/`verifyEmail`).
- MUST NOT branch UI copy on anything other than `errorCode` — `message` is always a
  ready-to-display string, and this migration does not change that contract, only
  which internal codes exist and how they're derived.
- MUST NOT reintroduce `completeGoogleOAuth`, `authorization_url`/`state`
  sessionStorage keys, or a route at `/auth/google/callback` that renders a page (that
  path now exists only as a redirect to `/login`, per spec Clarifications Q1).
