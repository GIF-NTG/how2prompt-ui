# Feature Specification: Auth API Contract Migration (v1.1.0)

**Feature Branch**: `004-auth-contract-migration`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Migrate frontend auth integration to API contract v1.1.0 (docs/api/openapi.yaml, docs/api/API_CONTRACT.md): JSON fields snake_case → camelCase, responses wrapped in ApiResponse<T> { data, meta }, pagination cursor-based → offset-based (page/size/PageMeta), Google OAuth flow changes from authorization-code redirect to POST /auth/oauth/google with idToken (drops /auth/oauth/google/callback), verify-email changes from GET ?token= to POST with { token } body, resend-verification returns 202, and the 410 error code becomes TOKEN_CONSUMED replacing VERIFY_TOKEN_EXPIRED/RESET_TOKEN_EXPIRED"

## Clarifications

### Session 2026-07-27

- Q: When a user hits the old `/auth/google/callback` URL after migration, what should happen? → A: Delete the callback page, but redirect that path straight to the login screen.
- Q: `.specify/memory/constitution.md` Principle III still quotes the error envelope's `trace_id` in snake_case, which the new contract renames to `traceId`; how should that stale reference be handled? → A: Fix it as part of this migration (a small constitution PATCH), not a separate follow-up.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Existing account flows keep working (Priority: P1)

A registered user continues to register, log in, log out, stay signed in across a
silent token refresh, and reset a forgotten password exactly as before, even though
the backend now speaks a different wire format (camelCase fields, wrapped
responses, a merged expired/used-token error code). The user should notice no
difference in behavior, wording, or reliability.

**Why this priority**: Every other auth capability builds on register/login/session
being correct. Any regression here blocks all users, not just an edge case.

**Independent Test**: Can be fully tested by running the existing register → login →
refresh → logout journey (and the forgot/reset-password journey) against the
backend running API contract v1.1.0, and confirming outcomes match pre-migration
behavior (success messages, redirects, error text) with no manual code reading
required.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they register with a valid email/password,
   **Then** the account is created and they see the same confirmation/verification
   prompt as before the migration.
2. **Given** a registered, verified user, **When** they log in with correct
   credentials, **Then** they land on the same authenticated screen as before, with
   their session correctly recognized as active.
3. **Given** a signed-in user whose access token is about to expire, **When** the
   silent refresh runs, **Then** their session continues uninterrupted with no
   forced logout or visible error.
4. **Given** a user who requested a password reset, **When** they submit a new
   password using an already-used or expired reset link, **Then** they see the same
   "link expired or already used" message as before, regardless of the error code
   now used internally to represent it.

---

### User Story 2 - Google sign-in keeps working under the new flow (Priority: P2)

A user who signs in with Google completes the flow in one step (consent → signed
in) instead of the previous two-step redirect-and-callback flow, since the backend
no longer exposes the authorization-code callback endpoint at all.

**Why this priority**: Google sign-in is a distinct, independently-testable path
from email/password, and its integration shape changes completely (not just field
names) — it needs its own verification pass, but it affects fewer users than P1's
core session flows.

**Independent Test**: Can be fully tested by completing a Google sign-in end to end
against the v1.1.0 backend and confirming the user reaches the authenticated app
state without being routed through a callback page that no longer has a backend
endpoint to call. Independently *testable/demoable* on its own merits — but it shares
the same session-assembly step User Story 1 introduces (`AuthResponse` + `GET
/users/me` → `Session`), so in build order User Story 1 must land first even though
the two remain separately verifiable.

**Acceptance Scenarios**:

1. **Given** a visitor on the login screen, **When** they choose "Sign in with
   Google" and complete Google's consent screen, **Then** they are signed into the
   app without being sent through a separate callback page/route.
2. **Given** a user whose Google sign-in attempt fails (Google denies consent or
   the backend rejects the credential), **Then** they see a clear error and can
   retry from the login screen, with no dead route left over from the old
   callback-based flow.
3. **Given** a user who follows an old, bookmarked, or in-flight
   `/auth/google/callback` link from before the migration, **Then** they are
   redirected straight to the login screen instead of seeing a blank or broken
   page.

---

### User Story 3 - Email verification keeps working under the new flow (Priority: P3)

A user verifies their email via the link sent to them, and can request a new
verification email, with the same outcomes as before even though verification is
now a single request carrying the token in its body (not the URL) and resending
is now acknowledged as "queued" rather than "sent."

**Why this priority**: Email verification is a narrower, already-independently-
delivered capability (US-1.6); it depends on P1's session/account handling but not
on P2's Google flow, so it can be verified last without blocking the higher-value
flows.

**Independent Test**: Can be fully tested by opening a valid verification link and
confirming the account becomes verified, then separately triggering "resend" and
confirming the user is told the email is on its way (not "sent successfully") and
that repeating the request while on cooldown still shows the same rate-limit
message as before.

**Acceptance Scenarios**:

1. **Given** an unverified user who opens a valid, unused verification link,
   **When** the app processes it, **Then** their account is marked verified and
   they see the same success state as before.
2. **Given** an unverified user who opens an expired or already-used verification
   link, **When** the app processes it, **Then** they see the same "link expired or
   already used" message as before.
3. **Given** an unverified, signed-in user, **When** they request the verification
   email be resent, **Then** they see confirmation that the request was accepted,
   and requesting again immediately shows the existing rate-limit message.

---

### Edge Cases

- What happens if the backend still returns an old-format (unwrapped, snake_case)
  response during a rolling deploy? The app should fail safely (surface a generic
  error) rather than silently misreading old fields as new ones or crashing.
- How does the app handle a reset-password or verify-email link clicked twice in a
  row (second click hits the now-shared "token consumed" condition)? Both cases
  must show the same expired/used messaging, since the backend no longer
  distinguishes them by a dedicated code.
- What happens to the Google OAuth callback route/link if a user has an old,
  bookmarked or in-flight callback URL from before the migration? The callback
  page itself is removed; visiting that path redirects straight to the login
  screen (the app has no generic not-found page today, so a plain deletion
  without a redirect would otherwise leave the visitor on a blank page).
- What happens if "resend verification" is accepted (202) but the email never
  arrives? Out of scope for this migration — this only changes what the app takes
  as confirmation of acceptance, not delivery guarantees, which are unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST correctly read every field the backend returns for
  register, login, refresh, logout, forgot-password, reset-password, verify-email,
  and resend-verification under the new field naming, so none of these flows break
  due to a field no longer being found under its old name.
- **FR-002**: System MUST retrieve the actual payload from every endpoint response
  that now wraps its data in an envelope, so the app operates on the real data
  rather than treating the envelope itself as the result.
- **FR-003**: System MUST complete Google sign-in using the single-request flow
  (no intermediate redirect/callback round trip) and MUST remove the now-dead
  callback screen and any code that only existed to support the old
  authorization-code flow, redirecting the old callback path straight to the
  login screen rather than leaving it unhandled.
- **FR-004**: System MUST submit the email-verification token as part of a
  request body rather than as part of the link's query string.
- **FR-005**: System MUST treat a "resend verification" request as successfully
  accepted based on the backend's new acknowledgment, without requiring or
  displaying wording that implies immediate delivery.
- **FR-006**: System MUST show the same "link expired or already used" message for
  both password-reset and email-verification links whenever the backend reports
  its (now shared) expired/used-token condition, without depending on it being two
  separate codes.
- **FR-007**: System MUST NOT reference, depend on, or fall back to any
  field name, response shape, or endpoint that the new contract removes or
  replaces (old field names, the unwrapped response shape, the Google OAuth
  callback endpoint, the old GET-based verify-email request). This applies to
  shapes the backend actually sends/expects on the wire — it does NOT require
  collapsing the app's own client-derived internal error-code names (e.g.
  keeping distinct `VERIFY_TOKEN_EXPIRED`/`RESET_TOKEN_EXPIRED` values is
  permitted; see Assumptions).
- **FR-008**: System MUST continue to work correctly for every already-shipped
  auth capability (registration, login, Google sign-in, logout, silent refresh,
  forgot/reset password, verify email, resend verification) with no user-visible
  change in wording, screens, or outcomes beyond what this migration explicitly
  requires (the Google flow losing its callback step, and resend feedback wording).

### Key Entities

- **Session**: The signed-in user's authentication state (identity, token
  validity, expiry) — same concept as before, now populated from response fields
  under their new names.
- **Auth error condition**: A small set of named conditions the user can
  encounter (invalid credentials, expired/used token, rate-limited, validation
  failure) — one of these conditions (expired/used token) is now represented by a
  single shared code across two flows (reset and verify) instead of one code per
  flow.
- **Verification link/request**: A user's attempt to confirm ownership of their
  email, now made as a single token-in-body request instead of a token-in-URL
  request, with an "accepted for delivery" outcome distinct from a "sent" outcome.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the existing auth journeys (register, login, logout, silent
  refresh, Google sign-in, forgot/reset password, verify email, resend
  verification) complete successfully end-to-end against the new backend contract,
  matching pre-migration outcomes from the user's point of view.
- **SC-002**: The existing automated test suite covering these auth journeys
  passes at the same rate as before the migration (no regressions introduced).
- **SC-003**: A user completing Google sign-in reaches the signed-in state in one
  fewer navigable step than before (no callback page to pass through).
- **SC-004**: Zero user-visible reports of "stuck" or silently-failed sessions,
  password resets, or email verifications attributable to a field, shape, or code
  the migration changed.

## Assumptions

- The backend has already deployed API contract v1.1.0 (or a compatible staging
  build) to an environment this app can be verified against; this migration does
  not include any backend work.
- This migration is scoped to the already-implemented Auth capabilities (Epic 1:
  US-1.1 through US-1.6) covered by `docs/api/openapi.yaml`'s Auth section. Other
  epics (templates, history, favorites, admin) are not yet implemented in this
  app, so their pagination style change has no current code to migrate — the new
  offset-based convention only needs to be honored once those features are built.
- The mock auth client used for local development/tests is updated alongside the
  real client so both stay consistent with each other and with the new contract;
  it is not a separate user-facing concern.
- "Same outcome as before" means matching user-visible wording and screen
  transitions already shipped for US-1.1–US-1.6, not necessarily identical
  internal error-code values, since those are an implementation detail this
  migration is explicitly changing.
- No new screens, copy, or user-facing capability are introduced by this
  migration — it only reconciles existing behavior with the backend's updated
  wire contract.
- This migration's scope includes a small documentation fix to
  `.specify/memory/constitution.md` Principle III, whose literal error-envelope
  example still shows `trace_id` in snake_case — it will be updated to `traceId`
  (a PATCH-level constitution amendment) alongside the code changes, rather than
  deferred to a separate `/speckit-constitution` pass.
