# Contract: `AuthClient`

This is the single integration point required by spec FR-009 ("All communication
with an authentication backend MUST go through a single, clearly identified
integration point"). Every screen and hook in the auth feature calls these methods
and nothing else talks to auth state. `authClient.ts` picks between
`authClient.mock.ts` and `authClient.real.ts` based on whether `VITE_API_BASE_URL`
is set (see `.env.example`) — no other file in `src/features/auth` or `src/shared`
needs to change to go live (spec SC-004).

> **Amendment (2026-07-24, implemented same day)**: Backend supplied the real
> contract at `docs/api/openapi.yaml`. `authClient.real.ts` now implements this
> interface against it:
>
> 1. **Google sign-in** for the real client uses the contract's authorization-code +
>    redirect flow (`GET /auth/oauth/google` → full-page redirect to Google →
>    Google redirects to `GoogleCallbackPage` at `/auth/google/callback` with
>    `code`+`state` → `POST /auth/oauth/google/callback`), via the new
>    `completeGoogleOAuth(code, state)` method added to `AuthClient`. The mock keeps
>    the client-side One Tap flow in `googleIdentity.ts` unchanged.
> 2. **The error shape**: `authClient.real.ts` catches the real
>    `{ error: { code, message, details, trace_id } }` envelope (via `httpClient.ts`'s
>    `ApiError`) and maps it onto this feature's `{ errorCode, message }` `AuthOutcome`
>    shape — the mapping lives entirely in `authClient.real.ts`, so `AuthOutcome`'s
>    own shape (and every screen that reads it) did not need to change.
> 3. **Session model**: `restoreSession()` is now `async` (interface change, both
>    implementations updated) because the real client must round-trip
>    `POST /auth/refresh` (using the httpOnly `refresh_token` cookie) then
>    `GET /users/me` to reconstruct a `Session` — there is no synchronous way to know
>    a cookie-backed session is still valid. `AuthProvider` also now schedules a
>    silent re-`restoreSession()` ~60s before `session.expiresAt`, so the real
>    15-minute `access_token` renews itself without signing the visitor out
>    mid-visit, as long as the refresh_token cookie remains valid.

```ts
interface GoogleSignInOptions {
  /** Demo/test-only hint (US4); a real implementation may ignore it. */
  simulate?: 'cancel'
}

interface AuthClient {
  login(email: string, password: string): Promise<AuthOutcome>
  register(displayName: string, email: string, password: string): Promise<AuthOutcome>
  signInWithGoogle(options?: GoogleSignInOptions): Promise<AuthOutcome>
  /** Real-client-only in practice: finishes the authorization-code flow from
   * GoogleCallbackPage. The mock always resolves an error if called. */
  completeGoogleOAuth(code: string, state: string): Promise<AuthOutcome>
  logout(): Promise<void>
  /** Async — the real client must round-trip to the backend to know if the
   * httpOnly refresh_token cookie is still valid; the mock wraps a synchronous
   * localStorage read in an already-resolved Promise. */
  restoreSession(): Promise<Session | null>
}
```

`AuthOutcome` and `Session` are defined in [data-model.md](../data-model.md).

## Method contracts

### `login(email, password)`

- **Given** `email`/`password` match the mock's known-valid demo credentials →
  resolves `{ status: 'success', session, accountCreated: false }` (spec US1
  scenario 1).
- **Given** they don't match → resolves `{ status: 'error', errorCode:
'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không chính xác' }` (US1
  scenario 2). Never rejects for this case — a wrong password is an expected outcome,
  not an exceptional one.
- Callers are responsible for FR-006/FR-007 (empty-field, malformed-email) validation
  _before_ calling this — `login` assumes both arguments are already well-formed and
  non-empty.

### `register(displayName, email, password)`

- **Given** `email` is not already used by a mocked existing account → resolves
  `{ status: 'success', session: null, accountCreated: true }` — see note below; the
  UI does not sign the visitor in automatically (spec FR-013), it routes to `/login`
  with a confirmation.
- **Given** `email` is already used → resolves `{ status: 'error', errorCode:
'EMAIL_ALREADY_EXISTS', message: 'Email này đã được đăng ký, hãy đăng nhập' }`
  (US2 scenario 2).
- Callers are responsible for FR-006/FR-007/FR-008 (empty fields, malformed email,
  password ≥ 8 characters) _before_ calling this.
- **Note on `session` for a `register` success**: `session` is always `null` here —
  per FR-013, creating an account MUST NOT sign the visitor in, so there is nothing
  to persist yet. `RegisterPage` navigates to `/login` regardless of this field (see
  `quickstart.md` validation scenario 2). Only `login()` and `signInWithGoogle()`
  return a non-null `session`.

### `signInWithGoogle(options?)`

- Opens the real Google Identity Services (One Tap) prompt via `googleIdentity.ts`
  and decodes the returned credential client-side (signature NOT verified — no
  backend yet). **Superseded by the real contract** (see amendment note above): the
  actual backend expects an authorization-code + redirect flow instead, not an ID
  token obtained client-side.
- **Given** the resolved Google email has no matching existing `Account` yet →
  resolves `{ status: 'success', session, accountCreated: true }` and creates the
  account (US4 scenario 1).
- **Given** the resolved Google email already matches an existing `Account.email`
  (from an earlier Google sign-in, or a password-registered account with the same
  email) → resolves `{ status: 'success', session, accountCreated: false }`, and that
  `session.accountId` is the existing account's id, not a new one (US4 scenario 2,
  FR-020).
- **Given** `options.simulate === 'cancel'` → resolves (does not reject)
  `{ status: 'error', errorCode: 'VALIDATION_ERROR', message: '' }` with an empty
  message, which the UI MUST treat as "no error to show, just return to signed-out"
  (US4 scenario 3) rather than displaying a blank error banner. This hint exists
  only because there is no real popup to cancel yet — a real implementation may
  ignore it entirely.

### `logout()`

- Clears the persisted session. Always resolves; there is nothing to fail against
  with no backend.

### `restoreSession()`

- Synchronous (no network/mock-delay — it only reads `localStorage`).
- Returns the stored `Session` if `expiresAt > Date.now()`, clearing and returning
  `null` if it has expired (spec Edge Case: expired mock session on reload).
- Called once by `AuthContext` on app load.

## What callers MUST NOT do

- MUST NOT read or write the `localStorage` session key directly — only
  `AuthContext`, via `restoreSession`/`logout`/the session from a successful
  `login`/`signInWithGoogle`, touches storage.
- MUST NOT branch UI copy on anything other than `errorCode` — `message` is a
  ready-to-display string, not a value to pattern-match on.
- MUST NOT call `fetch`/Axios/any transport directly from a page or component for
  auth purposes — that is exactly what this contract exists to prevent (FR-009).
