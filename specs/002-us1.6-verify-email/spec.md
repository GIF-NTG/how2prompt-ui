# Feature Specification: Verify Email (+ Resend)

**Feature Branch**: `[002-us1.6-verify-email]`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Hoàn thiện Epic 1 còn thiếu theo how2prompt-agentic/agent/BA.md US-1.6: verify email (+ resend)." (split out of the original combined "Account Recovery & Profile Management" spec — see Assumptions)

## Clarifications

### Session 2026-07-27

- Q: What cooldown should the "resend verification email" action show on the
  frontend? → A: A 5-minute countdown on the UI, matching the backend's rate limit
  per `agent/BA.md` US-1.6 (Alternative Flow: "rate limited to once per 5 minutes").

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verify email address (Priority: P1)

A newly registered user verifies their email via a link sent at signup so their
account is fully activated, and can request the link again if it expires or gets
lost.

**Why this priority**: Unverified accounts are usable today for the core generate
flow (per BA.md, verification gates only public-template-creation and AI Refine,
neither of which is built yet), but the gap still leaves users with no way to ever
verify — it's the sole remaining story once password recovery (`001-us1.5-...`) is
covered.

**Independent Test**: Can be fully tested by opening a verification link with a valid
token and confirming a "verified" banner state replaces the "please verify" banner.

**Acceptance Scenarios**:

1. **Given** a logged-in user has not verified their email, **When** they view any
   authenticated page, **Then** a persistent banner reminds them to verify, with a
   "resend email" action.
2. **Given** an unverified user clicks "resend email", **When** the request
   completes, **Then** they see a confirmation toast and the action is disabled with
   a visible 5-minute countdown.
3. **Given** an unverified user clicks "resend email" again before the 5-minute
   countdown elapses, **When** the system rejects the request as rate-limited,
   **Then** the UI shows a friendly "please wait" message instead of a raw error (the
   button is already disabled by the client-side countdown, so this covers a stale
   tab or a second device racing the same cooldown).
4. **Given** a user opens a valid, unexpired verification link, **When** the page
   loads, **Then** their account is marked verified and the reminder banner
   disappears on their next authenticated page view.
5. **Given** a user opens an expired or already-used verification link, **When** the
   page loads, **Then** they see a clear "link expired" message with a way to request
   a new one (routes to the same resend action as scenario 2).

---

### Edge Cases

- What happens when the verification link is opened on a device where the user isn't
  logged in? → The flow works without requiring an active session — it authenticates
  via the link's token, not the user's `access_token`.
- What happens if a user navigates away from the verify-email page mid-flow and
  returns via browser back button? → The token is re-validated from the URL each time
  the page loads; an already-used token is treated as expired (scenario already
  covered).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show a persistent reminder banner on authenticated
  pages for users whose email is not yet verified.
- **FR-002**: Users MUST be able to trigger a "resend verification email" action from
  the reminder banner.
- **FR-003**: The system MUST show a 5-minute countdown disabling the resend action
  after it is triggered, matching the backend's rate limit, and MUST surface a
  friendly message (not a raw error) if a `429` is still returned after the
  countdown (e.g. a second device/tab racing the same window).
- **FR-004**: The system MUST mark a user's email as verified when they open a valid
  verification link, and the reminder banner MUST no longer appear on subsequent page
  views.
- **FR-005**: The system MUST reject an expired or already-used verification link
  with a clear message and a path to request a new one.
- **FR-006**: This flow MUST surface backend validation and error-code failures as
  user-readable messages, following the existing error-handling pattern already used
  by login/register.

### Key Entities

- **Email Verification State**: A boolean per user account (verified / not verified)
  that gates the reminder banner's visibility; changed via a single-use link token.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of email-verification link outcomes (valid, expired, already-used)
  show the user an unambiguous next step — no dead ends or raw error text.
- **SC-002**: Verified users never see the "please verify" reminder banner again
  after successfully completing verification, on any subsequent page view.

## Assumptions

- The backend endpoints in `docs/api/openapi.yaml` (`/auth/verify-email`,
  `/auth/resend-verification`) are already deployed and match that contract; this
  feature only adds the frontend flows and wiring, not backend work.
- The reminder banner's exact copy/placement follows the visual tokens already
  established for auth screens (see CLAUDE.md's "Visual design direction") rather
  than introducing new UI patterns.
- This spec was split out of a combined "Account Recovery & Profile Management" spec
  (originally covering US-1.5/1.6/1.7 together) into one spec per user story, per the
  project's naming convention (`NNN-us<epic>.<n>-<slug>`) — see
  `001-us1.5-forgot-reset-password` and `003-us1.7-manage-profile` for the other two
  stories. They remain independently testable/deployable; splitting the spec doesn't
  imply they must ship as one PR.
