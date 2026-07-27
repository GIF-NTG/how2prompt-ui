# Phase 0 Research: Verify Email (+ Resend)

No `NEEDS CLARIFICATION` markers remained after `/speckit-clarify` (the 5-minute
countdown was resolved there). This file records the non-obvious technical decisions
the plan depends on.

## Decision 1: Extend `Session` with `emailVerified: boolean`

**Decision**: Add `emailVerified: boolean` to `src/features/auth/api/types.ts`'s
`Session`, sourced from `UserProfile.email_verified` (`docs/api/openapi.yaml`), which
is already embedded in `AuthResponse.user` — the same object `login`/`register`/
`restoreSession` already receive, just not fully typed yet (`authClient.real.ts`'s
`BackendUser` interface currently only declares `id`/`email`/`full_name`, a partial
view of the real `UserProfile` schema).

**Rationale**: FR-001 needs a per-user "is this account verified" flag available
wherever `AuthContext`'s `session` is read (the persistent banner lives in
`RootLayout`, outside any single page). The backend already returns this value on
every endpoint that returns a `UserProfile`/`AuthResponse` — no new endpoint call is
needed, just widening `BackendUser` to read a field the response body already
contains.

**Alternatives considered**:
- *Fetch `GET /users/me` separately on every route change to check verification
  status* — rejected: redundant network call for data already present in the
  session-issuing responses; also fails the "works without an active session"
  edge case worse than reusing what's already fetched.

## Decision 2: `resendVerificationEmail` takes an explicit `accessToken` param

**Decision**: `AuthClient.resendVerificationEmail(accessToken: string)` — the caller
(via `AuthContext`) passes the current session's token explicitly, rather than the
method reading session state itself.

**Rationale**: `POST /auth/resend-verification` has no `security: []` override, so it
inherits the global `security: [bearerAuth]` requirement — the request needs
`Authorization: Bearer <access_token>`. The real `AuthClient` implementation
(`authClient.real.ts`) is stateless between calls (it never stores a session itself;
`AuthProvider` does), so it has no other way to obtain the token. This mirrors how
`restoreSession()` already threads an explicit `accessToken` through to its own
`apiFetch('/users/me', { accessToken })` call.

**Alternatives considered**:
- *Make `AuthClient` stateful (store the current token internally)* — rejected: a
  much larger, unrelated architectural change (the mock and real clients are
  currently both stateless w.r.t. in-memory session data — `AuthProvider` is the only
  session holder); out of scope for this feature.

**Note (pre-existing, out of scope)**: `authClient.real.ts`'s existing `logout()` also
targets an endpoint that inherits the global `bearerAuth` requirement
(`POST /auth/logout`) but does not pass an `accessToken` today. This is a pre-existing
gap unrelated to this feature — not touched here, since fixing it isn't part of
US-1.6's scope and risks a regression review can't attribute to this feature.

## Decision 3: `verifyEmail` and 410 handling mirrors Decision 1 from `001-us1.5-...`

**Decision**: `GET /auth/verify-email?token=...` failures are branched on HTTP status
(`410` → `errorCode: 'VERIFY_TOKEN_EXPIRED'`), the same pattern already established by
`001-us1.5-forgot-reset-password`'s `ApiError.status` field for `/auth/reset-password`.

**Rationale**: `docs/api/openapi.yaml` documents only the `410` status for an expired
token on this endpoint too, not a specific `error.code` — same situation as the
reset-password token, already solved by the existing `ApiError.status` field (no new
`httpClient.ts` change needed here, it's reused as-is).

**Alternatives considered**: none new — this directly reuses `001`'s existing
decision and infrastructure.

## Decision 4: Session refresh after same-tab verification, via a new `AuthContext` action

**Decision**: Add `verifyEmail(token): Promise<VerifyEmailOutcome>` to `AuthContext`
(not just to `AuthClient`) — it calls `authClient.verifyEmail(token)`, and on success,
if a `session` is currently held in this tab, re-runs `authClient.restoreSession()` and
updates it, so `session.emailVerified` flips without requiring a manual logout/login.

**Rationale**: FR-004 requires the reminder banner to disappear once verified. The
verification link can be opened without an active session (edge case), so the
`AuthClient`-level `verifyEmail` call itself must not assume one exists. But when the
same browser tab *does* hold a live session (e.g. the user verifies via a second tab
and switches back), refreshing it immediately is a strictly better experience than
waiting for the next full page load, and costs only one already-existing
`restoreSession()` round-trip.

**Alternatives considered**:
- *Manually flip `session.emailVerified = true` in place* — rejected: trusts the
  client's own assumption that the token in the URL belongs to the currently logged-in
  account, which isn't guaranteed (the device may be logged into a different account
  than the one the link verifies); re-fetching via `restoreSession()` re-validates
  against the backend instead of assuming.

## Decision 5: Client-side resend cooldown is local component state, not persisted

**Decision**: The 5-minute countdown (FR-003) lives in the `EmailVerificationBanner`
component's own state (`useState`/`useEffect` timer), reset on remount — it is not
persisted to `localStorage` or synced across tabs.

**Rationale**: The spec's own scenario 3 already treats "a stale tab or a second
device racing the same cooldown" as backend-enforced (the friendly `429` message),
not something the client needs to coordinate across tabs for. Persisting the countdown
would add complexity (storage sync, clock skew across tabs) to cover a case the
backend's rate limit already handles correctly.

**Alternatives considered**:
- *Persist countdown end-time to `localStorage`* — rejected: unnecessary given the
  backend already rate-limits; adds a sync-bug surface for no spec-required benefit.
