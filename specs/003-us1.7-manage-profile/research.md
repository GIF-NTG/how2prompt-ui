# Phase 0 Research: Manage Personal Profile (US-1.7)

No `NEEDS CLARIFICATION` markers remain in the Technical Context. This document
records the concrete decisions made while reconciling the spec against
`docs/api/openapi.yaml` and the existing codebase conventions.

## Decision 1 — Reuse `src/features/auth`, no new feature module

**Decision**: `ProfileSettingsPage` lives at `src/features/auth/pages/ProfileSettingsPage.tsx`,
alongside `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`,
`VerifyEmailPage`.

**Rationale**: `CLAUDE.md`'s Epic 1 description already lists "manage profile" as
one bullet point alongside register/login/logout/forgot-reset-password, and every
other Epic 1 story lives under `src/features/auth`. Creating a separate
`src/features/profile` module for a single settings form would fragment one epic
across two feature directories for no structural benefit.

**Alternatives considered**: A new `src/features/profile` module — rejected as
premature separation; revisit only if profile-related screens grow substantially
(e.g. avatar upload, security settings) in a later increment.

## Decision 2 — `AuthClient` gains `getProfile`/`updateProfile`, mirroring the `resendVerificationEmail` pattern

**Decision**: Add to `AuthClient`:

```ts
getProfile(accessToken: string): Promise<ProfileOutcome>
updateProfile(accessToken: string, input: UpdateProfileInput): Promise<ProfileOutcome>
```

and to `AuthContext`/`AuthProvider`:

```ts
getProfile(): Promise<ProfileOutcome>
updateProfile(input: UpdateProfileInput): Promise<ProfileOutcome>
```

where the `AuthContext` versions read `session.token` internally (same invariant
as `resendVerificationEmail`: only ever called from UI that itself requires an
active session, not defended against `session === null`).

**Rationale**: This is the exact shape `resendVerificationEmail` already
established in `002-us1.6-verify-email` — an authenticated action that needs the
current access token but no other session data. Reusing it keeps the `AuthClient`
surface consistent rather than inventing a new calling convention.

**Alternatives considered**: Passing the whole `Session` object instead of just
`accessToken` — rejected; every other authenticated `AuthClient` method takes
`accessToken` alone, and `getProfile`/`updateProfile` don't need anything else
from `Session`.

## Decision 3 — `USERNAME_TAKEN` is client-derived from HTTP `409`, not a body error code

**Decision**: `PATCH /users/me`'s `409` response (`docs/api/openapi.yaml` line
~368: "Username đã tồn tại") has no documented `error.code` in its schema/example.
`authClient.real.ts.updateProfile` catches `ApiError` with `status === 409` and
maps it to a client-side `errorCode: 'USERNAME_TAKEN'`.

**Rationale**: Identical situation and identical resolution to
`RESET_TOKEN_EXPIRED`/`VERIFY_TOKEN_EXPIRED` in prior specs — the contract
documents a status code but not a body code for this case, so the frontend
derives its own stable name for UI branching rather than string-matching
`error.message`.

**Alternatives considered**: Branching UI logic on `error.message` text directly
— rejected; the existing convention in this codebase is to never branch on raw
message text (see `contracts/auth-client.md`'s "What callers MUST NOT do" in
prior specs).

## Decision 4 — Only `Session.displayName` is kept in sync; the rest of the profile is page-local state

**Decision**: `Session` (in `types.ts`) is NOT extended with `username`/`bio`/`locale`.
`ProfileSettingsPage` fetches the full profile itself via `getProfile()` on mount
and holds `username`/`bio`/`locale` as local form state. On a successful
`updateProfile()`, `AuthProvider` updates only `session.displayName` (to keep
`RootLayout.tsx`'s top-bar name in sync per FR-004); the page's own local state is
updated directly from the `PATCH` response, not by re-reading `Session`.

**Rationale**: Nothing else in the app currently reads `username`/`bio`/`locale`
from `Session` — adding them there would be speculative state with no other
consumer. `displayName` is the one field an existing screen (`RootLayout`)
already renders from `Session`, so it's the only one that needs to be mirrored
there for FR-004 to hold.

**Alternatives considered**: Storing the full `UserProfile` in `Session` — rejected
as unnecessary duplication of state that only one page (the settings page itself)
needs, and would require every other `Session`-producing path (`login`,
`signInWithGoogle`, `restoreSession`) to also fetch/carry fields nothing else
uses yet.

## Decision 5 — Client-side validation limits mirror only what the contract declares

**Decision**: `fullName` — required, max 150 chars (`UpdateProfileRequest.fullName`
maxLength). `username` — optional (nullable), max 50 chars
(`UpdateProfileRequest.username` maxLength), no format/charset validation invented
beyond what's declared. `bio` — optional, no length limit enforced client-side
(the schema declares none). `locale` — constrained to the `en`/`vi` enum via a
`<select>`, not free text, so no separate validation needed.

**Rationale**: FR-002 says client-side validation must match "the limits the
backend enforces" — inventing an undeclared `bio` length cap would risk rejecting
input the backend actually accepts, and silently diverging from the contract is
exactly what Constitution Principle III exists to prevent.

**Alternatives considered**: A generic reasonable `bio` cap (e.g. 500 chars) —
rejected; not declared anywhere in `docs/api/openapi.yaml`, so enforcing one
client-side would be a made-up constraint.

## Decision 6 — Settings page requires an active session; first protected-by-redirect route in this app

**Decision**: `ProfileSettingsPage` checks both `session` and `isRestoring` from
`useAuth()`. While `isRestoring` is `true`, it renders nothing (or a minimal
loading state) — it must NOT redirect yet. Only once `isRestoring` is `false` AND
`session` is still `null` does it redirect to `/login` (via
`<Navigate to="/login" replace />`, same mechanism `004-auth-contract-migration`
already introduced for the dead Google-callback route).

**Rationale**: `AuthProvider`'s `isRestoring` flag exists specifically to avoid
"flashing a signed-out UI while a real backend's httpOnly-cookie refresh is in
flight" (see its doc comment in `AuthContext.ts`). `session` starts `null` on
every fresh page load/direct navigation, including for an already-logged-in user,
until `restoreSession()` resolves. Checking `session === null` alone (without
`isRestoring`) would incorrectly redirect an actually-logged-in user to `/login`
on a direct navigation or reload of `/profile` against the real backend (the
mock client's `restoreSession()` resolves near-instantly, so this race is
invisible in mock-backed tests — caught during `/speckit-analyze`, not by
`vitest`). Every existing page either works identically for guests and users
(all existing auth pages are guest-only by nature: login, register, forgot/reset
password) or conditionally renders small pieces based on `session`
(`RootLayout`'s top bar, `EmailVerificationBanner`) — none of them needed this
guard because none of them redirect based on session state. This is the first
page whose entire content requires a session, so it's the first to need it.

**Alternatives considered**: A shared `<RequireAuth>` route-wrapper component —
rejected as premature abstraction for a single protected route; revisit if a
second protected page appears (e.g. history/favorites in a later epic). The
wrapper would still need to account for `isRestoring` internally either way.
