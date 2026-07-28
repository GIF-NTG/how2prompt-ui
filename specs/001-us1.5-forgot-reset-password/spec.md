# Feature Specification: Forgot & Reset Password

**Feature Branch**: `[001-us1.5-forgot-reset-password]`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Hoàn thiện Epic 1 còn thiếu theo how2prompt-agentic/agent/BA.md US-1.5: forgot/reset password." (split out of the original combined "Account Recovery & Profile Management" spec — see Assumptions)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Recover access via forgotten password (Priority: P1)

A registered user who cannot remember their password requests a reset link by email,
follows it, and sets a new password so they can log back in.

**Why this priority**: Without this, any user who forgets their password is
permanently locked out of their account and their prompt history — total loss of
access, the most severe kind of gap.

**Independent Test**: Can be fully tested by submitting an email on the "forgot
password" form, following the (simulated) reset link with a valid token, submitting a
new password, and confirming login succeeds with the new password and fails with the
old one.

**Acceptance Scenarios**:

1. **Given** a visitor is on the Login page, **When** they select "Forgot password?"
   and submit their registered email, **Then** the system shows a confirmation message
   ("if that email exists, a reset link was sent") without revealing whether the
   account exists.
2. **Given** a visitor submits an email that has no matching account, **When** the
   request completes, **Then** the same confirmation message is shown (identical to
   scenario 1 — no enumeration signal).
3. **Given** a user has a valid, unexpired reset link, **When** they open it and
   submit a new password meeting the strength rule, **Then** their password is
   updated and they are redirected to Login with a success message.
4. **Given** a user opens a reset link that has expired or was already used, **When**
   the reset page loads or they submit it, **Then** they see a clear "link expired,
   request a new one" message with a link back to the forgot-password form.
5. **Given** a user submits a new password shorter than the minimum length, **When**
   they submit the reset form, **Then** the same inline validation used at
   registration blocks submission with a visible error.

---

### Edge Cases

- What happens when a user requests a password reset for an email tied to a
  Google-only account (no password set)? → Out of scope for this feature; treated the
  same as any other email (silent 200) since the system must not reveal account
  existence or auth method either way.
- What happens if a user has two browser tabs open and completes password reset in
  one — does the other tab's stale session get invalidated? → Out of scope; token
  invalidation semantics are a backend concern already covered by the existing
  session-refresh mechanism (Principle III), not this frontend feature.
- What happens when the reset link is opened on a device where the user isn't logged
  in? → The flow works without requiring an active session — it authenticates via the
  link's token, not the user's `access_token`.
- What happens if a user navigates away from the reset-password page mid-flow and
  returns via browser back button? → The token is re-validated from the URL each time
  the page loads; an already-used token is treated as expired (scenario already
  covered).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users MUST be able to request a password reset by submitting their
  email from a "Forgot password?" entry point on the Login page.
- **FR-002**: The system MUST show an identical confirmation message regardless of
  whether the submitted email matches an existing account (no account-enumeration
  signal).
- **FR-003**: Users MUST be able to set a new password by following a reset link and
  submitting a password that is at least 8 characters — the same minimum-length rule
  already enforced on the Register form.
- **FR-004**: The system MUST reject an expired or already-used reset link with a
  clear message and a path back to requesting a new one.
- **FR-005**: This flow MUST surface backend validation and error-code failures as
  user-readable messages, following the existing error-handling pattern already used
  by login/register.

### Key Entities

- **Password Reset Request**: An email address submitted to trigger a reset link;
  short-lived, single-use, not directly visible to the user beyond the confirmation
  message.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user who forgets their password can regain access to their account
  (submit email → follow link → set new password → log in) in under 3 minutes,
  without contacting support.
- **SC-002**: 100% of password-reset link outcomes (valid, expired, already-used)
  show the user an unambiguous next step — no dead ends or raw error text.

## Assumptions

- The backend endpoints in `docs/api/openapi.yaml` (`/auth/forgot-password`,
  `/auth/reset-password`) are already deployed and match that contract; this feature
  only adds the frontend flows and wiring, not backend work.
- Password strength validation reuses the existing client-side rule already enforced
  on the Register form (minimum 8 characters) rather than introducing a new policy.
- This spec was split out of a combined "Account Recovery & Profile Management" spec
  (originally covering US-1.5/1.6/1.7 together) into one spec per user story, per the
  project's naming convention (`NNN-us<epic>.<n>-<slug>`) — see `002-us1.6-verify-email`
  and `003-us1.7-manage-profile` for the other two stories. They remain independently
  testable/deployable; splitting the spec doesn't imply they must ship as one PR.
