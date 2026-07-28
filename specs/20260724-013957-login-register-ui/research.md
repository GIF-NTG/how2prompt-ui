# Phase 0 Research: Login & Register UI (API-ready)

No items in Technical Context were left as `NEEDS CLARIFICATION` — the stack is fixed
by the existing repo (React 19 + TS + Vite + Tailwind v4 + React Router 7 + Vitest,
per `package.json` and the constitution's Technology & Architecture Constraints), and
the spec's own clarification session (2026-07-24) already resolved the product-level
unknowns (copy language, password rule, Google account linking). What remains here are
the implementation-pattern decisions the plan needs before Phase 1 design.

## Decision: Two routed views (`/login`, `/register`), not one view with a mode flag

**Rationale**: Spec FR-001 requires the views be "reachable from one another without a
full page reload." React Router's client-side navigation already satisfies that
without collapsing both forms into one component's internal state. Separate routes
also make each view independently linkable (e.g., a "create an account" link elsewhere
in the app can point straight at `/register`), and keeps each view's test file focused
on one form.

**Alternatives considered**:

- _Single `/auth` route with a tab toggle in local state_ — rejected: works, but
  produces one large component mixing two forms' validation and mock-call logic, and
  loses direct linkability to "just the register form."

## Decision: One `AuthClient` interface, with a single mock implementation module

**Rationale**: Spec FR-009/FR-010/FR-018 require exactly one integration point that
all three flows (login, register, Google) go through, returning a representative mock
outcome today and a real backend call later, with zero UI-facing shape change. A
plain TypeScript interface (`login`, `register`, `signInWithGoogle`, `logout`,
`restoreSession`) implemented by `authClient.mock.ts` today, imported everywhere
through one `authClient.ts` entry point, gives SC-004 ("connecting a real backend
requires changes at exactly one integration point") a literal, checkable meaning: swap
which implementation `authClient.ts` re-exports.

**Alternatives considered**:

- _Calling `fetch`/Axios directly from each form component, pointed at a not-yet-real
  URL_ — rejected: violates FR-009 outright (communication logic embedded in forms)
  and would need every form touched again once a real backend exists.
- _A feature flag / environment variable toggling mock vs. real inline in each form_ —
  rejected: still duplicates the branching logic per call site instead of in one place.

## Decision: Mock failure shape uses `error_code` strings matching `agent/BA.md` §4.2

**Rationale**: The submodule's BA spec already defines the real backend's eventual
RFC-7807 error vocabulary (`UNAUTHORIZED_ACCESS`, plus a duplicate-email equivalent
this feature names `EMAIL_ALREADY_REGISTERED` for consistency with that pattern).
Using the same `error_code` strings in the mock now means the UI's error-message
lookup (code → Vietnamese message) does not need to change shape when a real
RFC-7807 `problem+json` body starts arriving — only where the code is read from
(`outcome.errorCode` vs. `response.data.error_code`) changes, inside `authClient.ts`
alone.

**Alternatives considered**:

- _Ad hoc boolean + free-text message per mock failure_ — rejected: no stable key for
  the UI to switch on, so adopting a real backend's `error_code` later would require
  rewriting every call site's error handling instead of one adapter.

## Decision: Auto-resize measuring technique lives in `src/shared/hooks`, not in the auth feature

**Rationale**: Constitution Principle I is explicit that every placeholder/pill
surface — present and future — must use the _same_ hidden-span measuring technique
(`agent/BA.md` §4.3). The auth forms are the second consumer of this technique after
the (not-yet-built) Variable Canvas; putting it in `src/shared/hooks` from the start
avoids a near-certain future duplication (and drift) once the Canvas is built.

**Alternatives considered**:

- _Copy a small measuring function into `features/auth/components`_ — rejected:
  exactly the duplication Principle I exists to prevent; the second real usage would
  either diverge from or be refactored out of the auth feature later anyway.

## Decision: Mocked session mirrors a 7-day JWT-style expiry, stored under one `localStorage` key

**Rationale**: Spec FR-011/FR-012 require a signed-in state that survives reload for
"as long as the mocked session is considered valid." The project's existing
requirements documents (SRS AR-6, `agent/BA.md`) already settle on a 7-day JWT
lifetime for the real system; mirroring that number now (an `issuedAt` +
`expiresAt` pair in the stored session record, checked on load) means the UI's
session-restore logic will not need behavioral changes when a real JWT replaces the
mock token — only how the token is validated changes.

**Alternatives considered**:

- _Session lasts for the browser tab's lifetime only (sessionStorage, no expiry math)_
  — rejected: does not exercise the "restore across reload for a bounded period" path
  the real system needs (FR-011), so Story 3's demo-readiness goal would not actually
  prove that behavior.

## Decision: Google sign-in is a local mock button, no OAuth SDK added yet

**Rationale**: Spec Assumptions state Google sign-in is mocked in this phase, going
through the same `AuthClient` integration point. Adding a real OAuth client library
now would create a dependency with no working backend to validate its token against,
and nothing in the spec requires a real Google consent screen at this stage — only
that choosing the option resolves to a mocked signed-in (or first-time =
account-creation) outcome, per FR-017-FR-019.

**Alternatives considered**:

- _Integrate `@react-oauth/google` now, pointed at a placeholder client ID_ — rejected:
  adds a real external dependency and a Google Cloud console setup step for a flow
  that cannot be verified end-to-end without a backend anyway; revisit when the real
  backend exists to exchange the Google token.

### Amendment (2026-07-24): real Google identity, still no backend verification

The user supplied a real Google OAuth Client ID mid-implementation and asked for the
actual Google account picker instead of a fixed mock identity. Revised decision:
`signInWithGoogle()` now opens the real Google Identity Services (One Tap) prompt via
`src/features/auth/api/googleIdentity.ts`, using `VITE_GOOGLE_CLIENT_ID` (a public
value, safe in frontend code — **never** the OAuth client _secret_, which must only
ever live server-side and was explicitly not used here). The returned ID token is
decoded client-side for its `email`/`name` claims **without signature verification**,
since there is still no backend to verify it against — this remains a documented,
temporary limitation, not a security control. Everything downstream (the mock account
store, linking-by-email, session shape) is unchanged from the original mock design.

- **No new npm dependency added** — Google's script is loaded dynamically via a
  `<script>` tag (`https://accounts.google.com/gsi/client`), consistent with this
  project's preference for reusing platform capabilities over adding dependencies.
- The demo-only `signInWithGoogle({ simulate: 'cancel' })` hint (`authClient.types.ts`)
  is kept for tests/automation, but the `GoogleSignInButton` no longer exposes a
  separate "cancel" control in the UI — dismissing the real prompt now produces the
  same empty-message outcome naturally.

### Amendment (2026-07-24): real backend contract received — One Tap is the wrong flow

Backend supplied `docs/api/openapi.yaml`. It specifies Google sign-in as a standard
**authorization-code + redirect** flow: `GET /auth/oauth/google` returns
`{ authorization_url, state }`; the frontend does a full-page redirect to Google;
Google redirects back to a frontend callback route with `code` + `state`; the
frontend `POST`s those to `/auth/oauth/google/callback` and receives the real
`AuthResponse`. This is a **different flow** from the One Tap / client-side ID-token
approach adopted just above — One Tap never redirects, and never involves the
backend at all until after an identity is already established client-side.

**Also corrected**: the contract's error envelope is `{ error: { code, message,
details, trace_id } }`, not the flat `{ errorCode, message }` this feature's
`AuthOutcome` uses — see `data-model.md`'s and `contracts/auth-client.md`'s amendment
notes. `EMAIL_ALREADY_REGISTERED` was renamed to `EMAIL_ALREADY_EXISTS` to match the
real error code exactly.

### Amendment (2026-07-24, later same day): real client implemented

The gap noted above ("not yet implemented") was closed the same day, once asked to
build it ahead of time so connecting a real backend is just setting one env var.
New/changed files:

- `src/features/auth/api/httpClient.ts` — thin `fetch` wrapper: `credentials:
'include'` (so the httpOnly `refresh_token` cookie flows automatically), parses
  the real `{ error: {...} }` envelope into a throwable `ApiError`, and exposes
  `isApiConfigured()` (true iff `VITE_API_BASE_URL` is set).
- `src/features/auth/api/authClient.real.ts` — implements `AuthClient` against
  `docs/api/openapi.yaml`: `login`/`register` call `/auth/login`/`/auth/register`;
  `signInWithGoogle` fetches `/auth/oauth/google` and redirects the whole page
  (this call never meaningfully resolves — the tab navigates away); the new
  `completeGoogleOAuth(code, state)` method finishes the flow by posting to
  `/auth/oauth/google/callback`; `restoreSession` calls `POST /auth/refresh` then
  `GET /users/me`; `logout` calls `POST /auth/logout`.
- `src/features/auth/api/authClient.ts` — now picks `authClient.real.ts` vs
  `authClient.mock.ts` based on `isApiConfigured()`, instead of always the mock.
- `src/features/auth/pages/GoogleCallbackPage.tsx` (new) + route
  `/auth/google/callback` in `App.tsx` — where Google redirects back to; calls
  `completeGoogleOAuth` and signs the visitor in on success.
- `AuthClient.restoreSession()` became `async` (both implementations); `AuthClient`
  gained `completeGoogleOAuth`. `AuthProvider` now tracks `isRestoring` and schedules
  a silent `restoreSession()` ~60s before `session.expiresAt`, so the real
  15-minute `access_token` self-renews instead of signing the visitor out
  mid-session.

**Deliberately not done** (would require a live backend to verify, not just to
write): end-to-end testing of the redirect round trip, the `/auth/register` →
`/auth/login` email-verification gate the contract implies, and forgot/reset-password
— none of those are implemented, since they're new scope beyond this feature's
spec.md, not just a flow correction.

**Output**: All Technical Context items resolved; no `NEEDS CLARIFICATION` remains.
Proceeding to Phase 1.
