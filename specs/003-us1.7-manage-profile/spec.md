# Feature Specification: Manage Personal Profile

**Feature Branch**: `[003-us1.7-manage-profile]`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Hoàn thiện Epic 1 còn thiếu theo how2prompt-agentic/agent/BA.md US-1.7: manage personal profile." (split out of the original combined "Account Recovery & Profile Management" spec — see Assumptions)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage personal profile (Priority: P1)

A logged-in user updates their display name, username, bio, and language preference
from a settings page so their account details and locale stay accurate.

**Why this priority**: Sole story in this spec — see `001-us1.5-forgot-reset-password`
and `002-us1.6-verify-email` for the account-recovery stories this was split from,
which carry higher relative urgency within Epic 1 as a whole (this one is a
completeness gap, not a blocker: nothing else in the product depends on profile
fields being editable yet).

**Independent Test**: Can be fully tested by opening the profile settings page,
changing the display name and locale, saving, and confirming the change persists
across a page reload.

**Acceptance Scenarios**:

1. **Given** a logged-in user opens their profile settings page, **When** the page
   loads, **Then** it is pre-filled with their current full name, username, bio, and
   locale.
2. **Given** a user changes their full name and/or locale and saves, **When** the
   update succeeds, **Then** the new values are reflected immediately in the UI (e.g.
   the name shown in the account menu).
3. **Given** a user sets a username that is already taken by someone else, **When**
   they save, **Then** they see an inline "username already in use" error and no
   other field changes are lost.
4. **Given** a user submits a full name or bio exceeding the allowed length, **When**
   they save, **Then** an inline validation error blocks submission before any
   request is sent.

---

### Edge Cases

- What happens if a user leaves the username field blank? → Allowed; `username` is
  nullable per the backend contract, so an empty value is a valid "no username set"
  state, not a validation error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Logged-in users MUST be able to view and edit their profile (full name,
  username, bio, locale) from a dedicated settings page.
- **FR-002**: The system MUST validate profile fields client-side (length limits,
  required fields) before submitting an update, matching the limits the backend
  enforces.
- **FR-003**: The system MUST show an inline, field-specific error when a chosen
  username is already taken, without discarding the user's other unsaved changes.
- **FR-004**: Profile updates MUST be reflected in the UI immediately on success
  (e.g. the name shown in the account/nav menu) without requiring a page reload.
- **FR-005**: This flow MUST surface backend validation and error-code failures as
  user-readable messages, following the existing error-handling pattern already used
  by login/register.

### Key Entities

- **User Profile**: The editable subset of a user's account — full name, username,
  bio, locale — distinct from account-security fields (email, password) which are
  not editable through this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can update their display name or locale and see the change
  reflected in the UI in under 10 seconds, with zero data loss on a failed field
  (e.g. duplicate username) blocking the whole form.

## Assumptions

- The backend endpoints in `docs/api/openapi.yaml` (`/users/me` GET/PATCH) are
  documented and this feature only adds the frontend flows and wiring, not
  backend work — however, as of 2026-07-27 `GET /users/me` is known to return
  `404` on the live deployment (discovered while validating
  `specs/004-auth-contract-migration`), so real-backend verification of this
  feature is currently blocked until that's fixed; frontend implementation and
  testing against the mock client are unaffected (see plan.md's "Known
  live-backend caveat").
- Avatar upload (`POST /users/me/avatar`) is out of scope for this feature — profile
  management here covers only the text fields (full name, username, bio, locale)
  from `UpdateProfileRequest`; avatar upload can follow as a separate increment.
- `timezone` (also present in `UpdateProfileRequest`/`UserProfile`) is likewise
  out of scope for this feature, for the same reason as avatar upload — not
  something a user manages from this settings page yet.
- This spec was split out of a combined "Account Recovery & Profile Management" spec
  (originally covering US-1.5/1.6/1.7 together) into one spec per user story, per the
  project's naming convention (`NNN-us<epic>.<n>-<slug>`) — see
  `001-us1.5-forgot-reset-password` and `002-us1.6-verify-email` for the other two
  stories. They remain independently testable/deployable; splitting the spec doesn't
  imply they must ship as one PR.
