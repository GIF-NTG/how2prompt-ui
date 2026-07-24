# Feature Specification: Login & Register UI (API-ready)

**Feature Branch**: `feature/login-ui` (existing)

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "giao diện đăng nhập/đăng ký, hiện tại chưa có api nhưng hãy thiết kế sẳn để khi có api chỉ cần thêm link api vào thôi, nhớ là làm theo giao diện đã được lưu trong memory, khi tạo các file spec không sử dụng số thứ tự như 001 và dùng 1 id nào đó để đánh conflict khi các thành viên khác trong team cũng dùng speckit."

## Clarifications

### Session 2026-07-24

- Q: What language should all displayed copy (labels, buttons, error/success messages) on the Login/Register views use? → A: Vietnamese for all displayed copy (matches the approved artifact mockup and SRS.md).
- Q: What password rule should the Register view enforce client-side before allowing submission? → A: Minimum 8 characters, no additional complexity (special character / mixed case) requirement.
- Q: The user requested adding Google sign-in as a new capability. When a visitor signs in with Google using an email that already has an email/password account, how should that be treated? → A: Linked — same email means the same Account, just a second way to sign into it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Returning member signs in (Priority: P1)

A returning visitor who already has an account wants to sign back in so they can
resume access to their saved prompt history. They open the Login view, provide their
email and password as inline blanks inside a plain-language sentence (matching the
project's approved fill-in-the-blank interaction pattern), and submit.

**Why this priority**: Sign-in is the entry point to every Member-only capability
(history, saved variables). Without it working end-to-end in the UI, nothing else in
Epic 2/3 can be demonstrated, even before a real backend exists.

**Independent Test**: Can be fully tested today by opening the Login view, typing into
the inline email/password blanks, submitting, and observing one of the two mocked
outcomes (signed-in state shown in the nav, or an invalid-credentials message) —
without any real backend running.

**Acceptance Scenarios**:

1. **Given** the visitor is on the Login view with both blanks empty, **When** they
   type an email and a password and submit, **Then** the UI shows a signed-in state
   (e.g., their identifier appears in the primary navigation) and offers a way to sign
   out.
2. **Given** the visitor submits credentials that the mocked integration point marks
   as invalid, **When** the response comes back, **Then** the UI shows a clear
   "Email hoặc mật khẩu không chính xác" message inline, without navigating away or
   clearing what they typed.
3. **Given** the visitor leaves the password blank, **When** they attempt to submit,
   **Then** submission is blocked, the empty blank is visibly flagged, and focus moves
   to it — no request is attempted.

---

### User Story 2 - New visitor creates an account (Priority: P2)

A first-time visitor wants to create an account so future prompt sessions are saved.
They switch to the Register view, fill in their display name, email, and password as
inline blanks in a descriptive sentence, and submit.

**Why this priority**: Registration is the funnel into Member status; it depends on
the same inline-blank form primitive as Story 1 but is reached second in the typical
journey (a guest usually looks at Login first, or arrives via a "create an account"
link).

**Independent Test**: Can be fully tested today by switching to the Register view,
filling all three blanks, submitting, and observing the mocked "account created" flow
that hands the visitor to the Login view — without any real backend running.

**Acceptance Scenarios**:

1. **Given** the visitor fills in a display name, a well-formed email, and a password
   on the Register view, **When** they submit, **Then** the mocked integration point
   reports success and the UI moves the visitor to the Login view with a confirmation
   message.
2. **Given** the visitor submits an email the mocked integration point reports as
   already registered, **When** the response comes back, **Then** the UI shows a
   clear "Email này đã được đăng ký, hãy đăng nhập" message and offers a link to the
   Login view.
3. **Given** the visitor types an email without an "@" and a domain, **When** they
   move away from that blank or attempt to submit, **Then** the UI flags the blank as
   invalid before any request is attempted.

---

### User Story 3 - Session and error states are demo-ready without a backend (Priority: P3)

A team member (developer, designer, or reviewer) wants to see every state the auth
screens can be in — signed out, signed in, invalid credentials, duplicate email,
light/dark presentation — without needing a real API running, so the UI can be
reviewed and approved before backend work starts.

**Why this priority**: This is what makes the feature "wire the real API in later"
instead of "rebuild the screens later." It is lower priority than Stories 1-2 because
it's a byproduct of building them correctly, not a separate flow, but it is explicitly
called out because it's the point of doing this work before an API exists.

**Independent Test**: Can be fully tested today by triggering each mocked outcome
(success, invalid credentials, duplicate email) from the UI itself and confirming the
screen renders correctly in both light and dark presentation modes, with no backend
running.

**Acceptance Scenarios**:

1. **Given** no real authentication service is connected, **When** a visitor completes
   either form, **Then** the UI produces a realistic, structured outcome (success or a
   specific failure reason) sourced from one clearly identified place in the code, not
   scattered across the form components.
2. **Given** a visitor reloads the page after signing in, **When** the page finishes
   loading, **Then** the mocked session is restored and the UI still shows them as
   signed in (until the mocked session's validity period has passed).
3. **Given** the visitor's system or browser is set to a dark presentation mode,
   **When** they view either auth screen, **Then** all text and interactive elements
   remain clearly legible.

### User Story 4 - Sign in or register instantly via Google (Priority: P2)

A visitor — new or returning — wants to skip typing any blanks entirely and get
signed in with one action, using their existing Google identity.

**Why this priority**: It is a faster alternative path to the same outcome as
Stories 1 and 2 (a signed-in state), not a new outcome — valuable enough to build
alongside registration, but the inline email/password path (Stories 1-2) must work on
its own regardless of whether Google is available.

**Independent Test**: Can be fully tested today by choosing "Đăng nhập bằng Google"
from either view and observing the mocked provider flow resolve to a signed-in state
— without any real backend or real Google integration running.

**Acceptance Scenarios**:

1. **Given** a visitor with no existing account, **When** they choose "Đăng nhập bằng
   Google" and complete the mocked provider flow, **Then** the application signs them
   in immediately and treats this as account creation — no separate registration form
   is required.
2. **Given** a visitor's Google email matches an email already used by an existing
   email/password account, **When** they choose "Đăng nhập bằng Google", **Then** they
   are signed into that same existing account rather than a new, duplicate one.
3. **Given** a visitor cancels or dismisses the Google flow partway through, **When**
   they return to the application, **Then** they remain in the signed-out state with
   no error message shown.

---

### Edge Cases

- What happens when a visitor submits the Login form with both blanks empty? →
  Submission is blocked; the first empty blank receives focus (Story 1, Scenario 3).
- What happens when a visitor switches from Register to Login mid-way through typing?
  → Whatever they typed in the view they leave is discarded; switching views does not
  attempt to preserve partially-typed credentials across views.
- What happens when the mocked session's validity period has elapsed on reload? → The
  visitor is treated as signed out and returned to the signed-out state, the same way
  an expired real session will behave once a real API is connected.
- What happens if a visitor double-submits (e.g., double-clicks submit) before a
  response is available? → A second submission is not sent while one is already in
  flight.
- What happens when a visitor wants to abandon authentication entirely? → They can
  continue as a guest and reach the rest of the app without an account.
- What happens when a visitor types a password shorter than 8 characters on the
  Register view? → The blank is flagged as invalid before any request is attempted,
  the same way an empty blank is (Story 2).
- What happens when a visitor cancels the Google sign-in flow partway through? → They
  return to the signed-out state with no error shown (Story 4, Scenario 3).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST offer a Login view and a Register view, reachable
  from one another without a full page reload.
- **FR-002**: The Login view MUST present the email and password fields as inline
  fill-in-the-blank inputs embedded in a descriptive sentence, not as generic stacked
  boxed inputs, per the project's approved interaction pattern.
- **FR-003**: The Register view MUST present display name, email, and password fields
  in the same inline fill-in-the-blank style.
- **FR-004**: Each inline blank MUST visually resize to fit what has been typed into
  it, keeping the surrounding sentence readable.
- **FR-005**: The password blank MUST offer a way to reveal and re-hide the typed
  password.
- **FR-006**: Submitting either form with a required blank left empty MUST be blocked,
  MUST visibly flag the empty blank(s), and MUST move focus to the first one — before
  any request is attempted.
- **FR-007**: Submitting either form with a malformed email MUST be flagged as invalid
  before any request is attempted.
- **FR-008**: The Register view MUST require the password blank to contain at least 8
  characters before submission is attempted, flagged the same way an empty blank is;
  no additional complexity rule (special characters, mixed case) is required.
- **FR-009**: All communication with an authentication backend MUST go through a
  single, clearly identified integration point rather than being embedded directly in
  the form components, so that connecting a real backend later requires changing only
  that integration point's target and response handling, not the forms themselves.
- **FR-010**: Until a real backend is connected, the integration point MUST return
  representative mocked outcomes (success, invalid credentials, duplicate email) in
  the same structured shape the real backend is expected to use, so swapping the mock
  for a real call does not require reshaping how the UI reads the outcome.
- **FR-011**: On a successful mocked (or, later, real) login, the application MUST
  show a signed-in state (at minimum, the user's identifier in the primary
  navigation) and MUST offer a way to sign out.
- **FR-012**: A signed-in state MUST be restored automatically after a page reload for
  as long as the mocked session is considered valid, and MUST be cleared once that
  validity period has passed.
- **FR-013**: On a successful registration, the application MUST move the visitor to
  the Login view and MUST show a confirmation that the account was created.
- **FR-014**: On a failed login or registration attempt, the application MUST show a
  specific, human-readable reason in Vietnamese (e.g., "Email hoặc mật khẩu không
  chính xác", "Email này đã được đăng ký") rather than a generic error.
- **FR-015**: A visitor MUST be able to dismiss authentication entirely and continue
  using the application without an account.
- **FR-016**: Both auth views MUST remain fully legible and usable under both light
  and dark presentation modes.
- **FR-017**: Both the Login and Register views MUST offer a "Đăng nhập bằng Google"
  option as an alternative to filling in the inline blanks.
- **FR-018**: Choosing "Đăng nhập bằng Google" MUST go through the same single
  integration point as FR-009, and — until a real Google sign-in is connected — MUST
  resolve to a representative mocked successful sign-in.
- **FR-019**: A visitor's first successful Google sign-in MUST be treated as account
  creation; it MUST NOT require them to separately complete the Register view.
- **FR-020**: When a Google sign-in's email matches an email already used by an
  existing account, the application MUST treat it as the same account (linked by
  email) rather than creating a second, duplicate one.

### Key Entities

- **Account**: A person's registered identity — display name, email, password (never
  shown in plain text once submitted), and which sign-in method(s) it can be reached
  by (email/password, Google, or both). Email is the identifier used to link a Google
  sign-in to an existing account. Represents what Story 2 and Story 4 create.
- **Session**: The client-held record that a visitor is currently signed in and as
  whom, plus how long that standing is valid for. Represents what Story 1 establishes
  and Story 3 must be able to restore or expire convincingly without a backend.
- **Auth outcome**: The structured result of a login, registration, or Google
  sign-in attempt — success, or a specific, named failure reason. This is the shape
  the mocked integration point produces today and the real backend must produce later
  without the UI changing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can go from opening the Register view to seeing the
  "account created" confirmation in under 30 seconds, without outside help.
- **SC-002**: A returning visitor can complete sign-in in a single submission at least
  95% of the time when their credentials are correct on the first attempt.
- **SC-003**: 100% of attempts to submit with an empty required blank are caught and
  visibly flagged within the same interaction, with no page reload.
- **SC-004**: When a real authentication backend becomes available, connecting it
  requires changes at exactly one integration point — zero changes to the visual
  layout or interaction of either auth view.
- **SC-005**: All text and interactive controls on both auth views meet standard
  legibility expectations in both light and dark presentation modes.
- **SC-006**: A visitor can reach a signed-in state via Google in a single action,
  without filling in any blanks.

## Assumptions

- No authentication backend exists yet. Every login/registration outcome in this
  phase is produced by a mocked integration point using representative data, shaped to
  match the error/session conventions already defined for this project (structured
  failure reasons; a time-limited signed-in session) so that connecting a real
  backend later is additive, not a rework.
- The visual and interaction direction is the inline fill-in-the-blank pattern already
  approved for this project's auth screens (cool paper neutrals, indigo accent,
  monospace reserved for placeholder/template motifs, full light/dark support) —
  this feature refines and completes that direction rather than introducing a new one.
- Registration collects exactly three fields: display name, email, password — no
  additional profile fields, consistent with the project's existing requirements
  documents.
- A successful registration always hands the visitor to the Login view rather than
  signing them in automatically, consistent with the project's existing requirements
  documents.
- "Continue as guest" already exists as a concept in the product (browsing without an
  account); this feature does not change that path, only ensures both auth views
  remain easy to back out of.
- Google sign-in is mocked in this phase the same as email/password auth — no real
  Google OAuth integration exists yet. It goes through the same single integration
  point (FR-009) so that connecting the real provider later is additive.
- Account linking by email (Q3, session 2026-07-24) is a client-side/UI-observable
  behavior assumption for this phase; the real backend's actual account-merge logic
  is out of scope for this feature and will be validated against this same behavior
  when it exists.
