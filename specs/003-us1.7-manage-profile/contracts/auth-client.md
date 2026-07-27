# Contract Amendment: `AuthClient` + `AuthContext` — Manage Personal Profile (US-1.7)

This amends the `AuthClient` contract, most recently amended by
`specs/002-us1.6-verify-email/contracts/auth-client.md`. That contract's "single
integration point" rule and "What callers MUST NOT do" list apply unchanged to the
two methods added here.

```ts
interface AuthClient {
  // ...existing methods unchanged...

  /** Fetches the caller's own profile. Requires an active session's access token. */
  getProfile(accessToken: string): Promise<ProfileOutcome>

  /** errorCode 'USERNAME_TAKEN' signals a duplicate username (409). Requires the
   *  caller's current access token. */
  updateProfile(accessToken: string, input: UpdateProfileInput): Promise<ProfileOutcome>
}

interface AuthContextValue {
  // ...existing session/signIn/signOut/etc. unchanged...

  /** Reads session.token internally; only called from UI that already requires a session. */
  getProfile(): Promise<ProfileOutcome>

  /** Reads session.token internally. On success, also updates session.displayName
   *  (see data-model.md) so the top-bar name reflects the change immediately. */
  updateProfile(input: UpdateProfileInput): Promise<ProfileOutcome>
}
```

`UserProfile`, `UpdateProfileInput`, and `ProfileOutcome` are defined in
[data-model.md](../data-model.md).

## Method contracts

### `AuthClient.getProfile(accessToken)`

- **Given** a valid `accessToken` → resolves `{ status: 'success', profile }` with
  the caller's current `fullName`/`username`/`bio`/`locale`.
- **Given** an expired/invalid `accessToken` → resolves
  `{ status: 'error', errorCode, message }` using the backend's actual `error.code`
  (e.g. `TOKEN_EXPIRED`) — the caller (`ProfileSettingsPage`) surfaces this exactly
  like every other `AuthClient` failure, no special case.
- **Real implementation**: `GET /users/me`, per `docs/api/openapi.yaml`.

### `AuthClient.updateProfile(accessToken, input)`

- **Given** a valid `accessToken` and a `username` not already taken by another
  account → resolves `{ status: 'success', profile }` with the saved values.
- **Given** a `username` already taken by a different account → resolves
  `{ status: 'error', errorCode: 'USERNAME_TAKEN', message }` (derived from
  `ApiError.status === 409`) — the caller shows this as a field-specific inline
  error under the username input (FR-003) without discarding other unsaved field
  values, since the form state lives in the page, not in `AuthClient`.
- **Given** any other backend failure → resolves `{ status: 'error', errorCode,
  message }` using the backend's actual `error.code`.
- **Real implementation**: `PATCH /users/me` with body `input`
  (`{ fullName, username, bio, locale }`), per `docs/api/openapi.yaml`.

### `AuthContext.getProfile()`

- Invariant: only ever called from UI (`ProfileSettingsPage`) that itself only
  renders when `session` is non-null (redirects to `/login` otherwise — research.md
  Decision 6). Forwards to `AuthClient.getProfile(session.token)`.

### `AuthContext.updateProfile(input)`

- Same invariant as `getProfile()`. Forwards to
  `AuthClient.updateProfile(session.token, input)`. On `{ status: 'success' }`,
  additionally calls `setSession({ ...session, displayName: outcome.profile.fullName })`.
  Returns the same `ProfileOutcome` the underlying `AuthClient` call produced,
  unchanged — the session update is a side effect, not part of the outcome
  contract.

## Mock implementation notes (`authClient.mock.ts`)

See data-model.md "Mock implementation notes" — `MockAccountRecord` gains
`username`/`bio`/`locale`; `updateProfile` checks for a username collision against
*other* accounts (not itself) before applying the update.

## What callers MUST NOT do (unchanged, restated for these two methods + actions)

- MUST NOT call `fetch`/`apiFetch` directly from `ProfileSettingsPage` — go through
  `AuthContext` (which itself goes through `authClient`).
- MUST NOT branch UI copy on anything other than `errorCode` (including the new
  client-derived `USERNAME_TAKEN`) — `message` is a ready-to-display string.
- MUST NOT store the full `UserProfile` in `Session` — only `displayName` is
  mirrored there (research.md Decision 4); `ProfileSettingsPage` holds
  `username`/`bio`/`locale` as its own local state.
