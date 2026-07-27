# Feature Specification: Fix Resend-Verification Contract & Add Login-Screen Resend Action

**Feature Branch**: `005-fix-resend-verification`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Fix /auth/resend-verification contract mismatch and add a resend-verification action reachable from the login screen: the real backend endpoint takes { email } in the request body and requires no Authorization header (public, like forgot-password) — contradicting docs/api/openapi.yaml, which currently documents it as requiring Bearer auth with no body. Update the contract doc, change AuthClient.resendVerificationEmail to take an email instead of an accessToken (EmailVerificationBanner keeps working since Session already has .email), and add a "resend verification email" action on LoginPage that appears when login fails with EMAIL_NOT_VERIFIED, resolving the previously-identified dead-end where a newly registered user with a lost/expired verification email had no way to request a new one before this endpoint's real shape was discovered."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unverified user recovers from login via resend action (Priority: P1)

A user registered an account, but their verification email was lost, deleted, or its
link expired. They return to the login screen, enter their credentials, and login is
rejected because their email isn't verified yet. Today this is a dead end: they have
no session, so the in-app verification banner never appears, and they have no way to
trigger a new verification email without one. This story gives them a way out directly
from the login failure.

**Why this priority**: This is the actual dead-end the feature exists to close. Without
it, an affected user's only recourse is contacting support, which is exactly the gap
this feature must resolve.

**Independent Test**: Attempt to log in with an unverified account's credentials. Confirm
the failure state offers a "resend verification email" action, that triggering it
requests a new verification email using only the email address already entered in the
login form (no session or access token involved), and that the outcome (success,
rate-limited, or other failure) is shown to the user in place.

**Acceptance Scenarios**:

1. **Given** a registered but unverified account, **When** the user submits correct
   credentials on the login screen, **Then** login fails and the screen shows a
   "resend verification email" action alongside the failure message.
2. **Given** the resend action is visible after a failed login, **When** the user
   activates it, **Then** the system requests a new verification email for the address
   entered in the login form and shows a confirmation that the request was accepted.
3. **Given** the user has just triggered a successful resend, **When** they immediately
   activate the resend action again, **Then** the system shows a rate-limited message
   instead of sending another request (matching the existing resend cooldown behavior
   used elsewhere in the app).
4. **Given** a login attempt that fails for any other reason (wrong password, locked
   account, etc.), **When** the failure is shown, **Then** the resend action does NOT
   appear — it is specific to the unverified-email failure.

---

### User Story 2 - Already-authenticated user can still resend from the in-app banner (Priority: P2)

A user did log in successfully (their account was verified enough to be issued a
session, or they're mid-verification for a secondary reason) and sees the existing
in-app "verify your email" banner. Resending from that banner must keep working
exactly as it does today, since this feature only changes how the resend request
identifies the user, not the banner's own behavior or placement.

**Why this priority**: This is a non-regression requirement, not new functionality —
it exists to guarantee the fix to the public/no-auth contract doesn't break the one
place resend already works.

**Independent Test**: With a logged-in, unverified session, trigger resend from the
existing banner and confirm the same success/rate-limited/error outcomes appear as
before, without requiring any code change to the banner itself.

**Acceptance Scenarios**:

1. **Given** an authenticated session for an unverified account, **When** the user
   clicks "Gửi lại email" on the verification banner, **Then** a new verification email
   is requested for that session's own email address and the existing success message
   is shown.
2. **Given** the banner's cooldown is active, **When** the user attempts to resend
   again, **Then** the same rate-limited message appears as before.

---

### Edge Cases

- What happens if the user changes the email field on the login form after a failed
  attempt and then activates resend — does it request verification for the newly typed
  address, or the one from the failed attempt? Resend uses whatever email is currently
  in the login form's email field at the moment the action is activated.
- What happens if the email field is empty or invalid when resend is activated from the
  login screen? The action must not be usable without a syntactically valid email
  address — same validation already applied to the login form's email field.
- What happens if the backend still returns a generic/unexpected error on resend (e.g.
  the email doesn't exist)? The user sees the same generic error-message passthrough
  pattern already used elsewhere for resend outcomes — no new error-handling paths.
- What happens on repeated login attempts against an unverified account? Each failed
  attempt independently re-shows the resend action; it is not a one-time offer per
  session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The documented contract for the resend-verification endpoint MUST match
  its real deployed behavior: a public request (no Authorization header required) that
  submits the target email address in the request body, matching the pattern already
  documented for the forgot-password request.
- **FR-002**: The system MUST allow requesting a new verification email by supplying
  only an email address — no active session or access token may be required to do so.
- **FR-003**: The login screen MUST offer a "resend verification email" action when,
  and only when, a login attempt fails specifically because the account's email is not
  verified.
- **FR-004**: Activating the resend action from the login screen MUST request a new
  verification email for the email address currently entered in the login form, without
  requiring the user to have a session.
- **FR-005**: The resend action's outcome (accepted, rate-limited, or other failure)
  MUST be shown to the user in place on the login screen, following the same
  outcome-messaging pattern already used by the existing in-app verification banner.
- **FR-006**: The existing in-app verification banner's resend behavior MUST continue
  to work unchanged from the user's perspective (same triggers, same cooldown, same
  outcome messages), sourcing the email address from the authenticated session instead
  of a login form.
- **FR-007**: The resend action MUST NOT appear for login failures caused by any reason
  other than the account's email not being verified (e.g. wrong credentials, locked
  account).
- **FR-008**: The documented contract for the login endpoint's failure response MUST
  list `EMAIL_NOT_VERIFIED` as a possible error code, since the resend action's
  visibility depends on that code being a stable, documented contract value rather
  than an incidentally observed one.

### Key Entities

- **Verification email request**: An action tied to a single email address (not a
  session or account ID) that asks the system to send a new verification email to
  that address if eligible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user whose verification email is lost or expired can request a new one
  and reach a verified, working account without contacting support, entirely through
  the login screen.
- **SC-002**: The documented request/response shape for requesting a new verification
  email matches its real, observed backend behavior with zero discrepancies.
- **SC-003**: Every existing user-facing behavior of the in-app verification banner
  (trigger, cooldown, success/error messaging) is unchanged after this change, verified
  by re-running its existing test coverage with no expected-behavior changes.

## Assumptions

- The backend's real resend-verification behavior (public, `{ email }` body, no
  Authorization header) was already directly observed against the live deployment
  (see prior investigation) and is treated as ground truth over the currently written
  contract doc.
- Rate-limiting / cooldown semantics for a resend request are unchanged by this
  feature — the same "just requested, wait before retrying" behavior already used by
  the in-app banner applies regardless of whether the request originates from the
  login screen or the banner.
- The login screen already validates the email field's syntax before submission; the
  resend action reuses that same validation rather than introducing a new rule.
- No new persona, permission, or account state is introduced — this only changes how
  an existing capability (requesting a new verification email) is invoked and where
  it's reachable from.
</content>
