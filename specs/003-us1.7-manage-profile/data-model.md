# Phase 1 Data Model: Manage Personal Profile (US-1.7)

## New: `UserProfile` (`src/features/auth/api/types.ts`)

The editable subset of the backend's `UserProfile` schema this feature reads/writes
(the full schema also has `id`, `email`, `avatarUrl`, `timezone`, `plan`, `isAdmin`,
`personalWorkspaceId`, `createdAt` — none of which this feature displays or edits):

```ts
export interface UserProfile {
  fullName: string
  username: string | null
  bio: string | null
  locale: 'en' | 'vi'
}
```

## New: `UpdateProfileInput` (`src/features/auth/api/types.ts`)

```ts
export interface UpdateProfileInput {
  fullName: string
  username: string | null
  bio: string | null
  locale: 'en' | 'vi'
}
```

Identical shape to `UserProfile` in this feature's scope (both are the same four
editable fields) — kept as a separate type name for clarity at call sites
(`getProfile` returns a `UserProfile`, `updateProfile` takes an `UpdateProfileInput`),
not because the shapes differ.

## New: `ProfileOutcome` (`src/features/auth/api/types.ts`)

```ts
export type ProfileOutcome =
  | { status: 'success'; profile: UserProfile }
  | { status: 'error'; errorCode: AuthErrorCode | 'USERNAME_TAKEN'; message: string }
```

- Returned by both `getProfile` (success always carries the fetched profile) and
  `updateProfile` (success carries the profile as saved by the backend — the
  page updates its local form state from this, not by re-fetching).
- `'USERNAME_TAKEN'` is client-derived from `ApiError.status === 409` (research.md
  Decision 3), same convention as `'RESET_TOKEN_EXPIRED'`/`'VERIFY_TOKEN_EXPIRED'`.

## Modified: `AuthClient` (`src/features/auth/api/authClient.types.ts`)

```ts
interface AuthClient {
  // ...existing methods unchanged...
  getProfile(accessToken: string): Promise<ProfileOutcome>
  updateProfile(accessToken: string, input: UpdateProfileInput): Promise<ProfileOutcome>
}
```

## Modified: `AuthContext` (`src/features/auth/context/AuthContext.ts` / `AuthProvider.tsx`)

```ts
interface AuthContextValue {
  // ...existing session/signIn/signOut/etc. unchanged...
  getProfile(): Promise<ProfileOutcome>
  updateProfile(input: UpdateProfileInput): Promise<ProfileOutcome>
}
```

- Both read `session.token` internally (invariant: only called from UI that
  itself requires an active session — `ProfileSettingsPage` redirects to `/login`
  otherwise; research.md Decision 6).
- `updateProfile`, on `{ status: 'success' }`, additionally calls
  `setSession({ ...session, displayName: outcome.profile.fullName })` so
  `RootLayout.tsx`'s top-bar name updates immediately (FR-004) without a full
  `restoreSession()` round trip. `Session` itself gains no new fields
  (research.md Decision 4).

## Mock implementation notes (`authClient.mock.ts`)

- `MockAccountRecord` gains `username: string | null`, `bio: string | null`,
  `locale: 'en' | 'vi'` (default `'vi'` for the seeded demo account and any newly
  registered mock account, matching the app's existing Vietnamese-first UI).
- `getProfile(accessToken)`: resolves the account matching the session persisted
  under that token (same lookup pattern `resendVerificationEmail`/`verifyEmail`
  already use via `readStoredSession()`), mapped to `UserProfile`.
- `updateProfile(accessToken, input)`: if `input.username` is non-null and already
  used by a *different* mock account, resolves
  `{ status: 'error', errorCode: 'USERNAME_TAKEN', message: 'Tên người dùng này đã được sử dụng.' }`
  without mutating the record; otherwise updates the record's four fields in place
  and resolves `{ status: 'success', profile }`.

## Real implementation notes (`authClient.real.ts`)

- `getProfile(accessToken)`: `GET /users/me` with `Authorization: Bearer <accessToken>`
  → maps the response's `fullName`/`username`/`bio`/`locale` onto `UserProfile`
  (ignores the other fields in the full backend schema).
- `updateProfile(accessToken, input)`: `PATCH /users/me` with the same header,
  body `input` as-is (already camelCase, matches `UpdateProfileRequest` exactly).
  `error.status === 409` → `USERNAME_TAKEN`; anything else → the backend's actual
  `error.code`/`message` via the existing `toErrorOutcome` helper.
