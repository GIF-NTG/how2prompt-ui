# Feature Specification: Admin Mark Template as Featured

**Feature Branch**: `013-us6.1-admin-mark-featured`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "As an Admin, I want to mark specific templates as
'Featured' (and unmark them), so that they appear in the Featured carousel on the
homepage and are highly visible to users. Reference:
how2prompt-agentic/docs/user-stories/us-6.1-admin-mark-template-as-featured.md
(US-6.1, UC-06.01, Epic 6 — Admin Content Management, priority P2)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Mark a template as Featured (Priority: P1)

An Admin, while managing the template catalog, wants to promote a specific template
so it shows up in the Featured carousel that Guests and Users see on the homepage.

**Why this priority**: This is the entire point of the feature — without the ability
to set the flag, there's nothing to unset, and the Featured carousel (already
consuming `GET /templates/featured` on the homepage) has no way to be populated by an
Admin action.

**Independent Test**: Can be fully tested by logging in as Admin, opening a template
in the admin template list/edit view, toggling "Featured" on, saving, and then
confirming the template appears in the homepage's Featured carousel.

**Acceptance Scenarios**:

1. **Given** I am logged in as an Admin and viewing a template's edit form, **When**
   I turn on the "Featured" toggle and save, **Then** the template is marked as
   featured and the admin UI reflects the new state without a page reload.
2. **Given** a template I just marked as Featured, **When** a Guest or User visits
   the homepage, **Then** that template appears in the Featured carousel.

---

### User Story 2 - Unmark a template as Featured (Priority: P1)

An Admin wants to remove a template from the Featured carousel, e.g. because it's
outdated or a different template should take its place.

**Why this priority**: Equally essential to Story 1 — a one-way "mark as featured"
with no way to reverse it isn't a usable admin workflow and would require a database
intervention to undo, which is unacceptable for a routine content-management action.

**Independent Test**: Can be fully tested by taking an already-featured template,
toggling "Featured" off in the admin edit form, saving, and confirming it disappears
from the homepage's Featured carousel.

**Acceptance Scenarios**:

1. **Given** a template is already marked Featured, **When** I turn the "Featured"
   toggle off and save, **Then** the template is no longer marked as featured.
2. **Given** a template I just unmarked, **When** a Guest or User visits the
   homepage, **Then** that template no longer appears in the Featured carousel.

---

### User Story 3 - See current Featured status at a glance (Priority: P2)

An Admin browsing the template list wants to see which templates are already
Featured without opening each one individually, so they can decide what to
feature/unfeature without redundant clicks.

**Why this priority**: A quality-of-life addition on top of Stories 1–2 — the
feature is usable without it (open each template to check), but a list-level
indicator is what makes the workflow efficient once the catalog has more than a
handful of templates.

**Independent Test**: Can be fully tested by featuring one template, then loading the
admin template list and confirming a visible indicator (e.g. a badge) distinguishes
it from non-featured templates in the same list.

**Acceptance Scenarios**:

1. **Given** at least one template is Featured and others are not, **When** I open
   the admin template list, **Then** featured templates show a distinct visual
   indicator (e.g. a "Featured" badge) and non-featured templates do not.

---

### Edge Cases

- What happens if an Admin tries to feature a template that is not yet published
  (still `draft`)? The toggle action MUST still succeed (the flag is independent of
  publish state), but the template only becomes visible in the public Featured
  carousel once it is published — same rule as any other unpublished template not
  appearing in public browsing surfaces.
- What happens if the same template is featured and unfeatured in quick succession
  (e.g. double-click)? The system MUST end up in the state of the last successful
  save; no duplicate or conflicting flag values.
- What happens if there is no upper limit configured and an Admin features a large
  number of templates? The Featured carousel MUST simply render however many
  templates are currently featured — no artificial cap is introduced by this
  feature (a curation guideline for Admins, not a system constraint).
- What happens if an Admin without sufficient permission (a non-Admin User or Guest)
  attempts this action directly (e.g. by replaying a request)? The system MUST
  reject it the same way it rejects any other admin-only write action.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST allow an Admin to mark a template as "Featured" from
  the admin template management UI.
- **FR-002**: The system MUST allow an Admin to unmark a template that is currently
  "Featured" from the same admin template management UI.
- **FR-003**: The system MUST persist the Featured state per template so it survives
  reloads and is visible to every Admin, not just the one who set it.
- **FR-004**: The Featured carousel shown on the homepage MUST reflect exactly the
  set of templates currently marked Featured — no manual sync step required.
- **FR-005**: The admin template list MUST visually distinguish Featured templates
  from non-Featured ones.
- **FR-006**: Toggling the Featured state MUST NOT alter any other property of the
  template (title, prompt body, variables, publish status, etc.) and MUST NOT create
  a new template version.
- **FR-007**: Only an Admin MUST be able to change a template's Featured state;
  Guests and Users MUST NOT have access to this action.
- **FR-008**: The system MUST reflect a Featured-state change in the admin UI
  immediately after a successful save (no manual refresh needed).

### Key Entities

- **Template**: gains a Featured attribute (on/off, plus an implicit "since when"
  timestamp) alongside its existing metadata (title, description, category, publish
  status). Featured is independent of publish status and template versioning.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An Admin can feature or unfeature a template in under 10 seconds from
  the admin template list, without navigating through unrelated screens.
- **SC-002**: 100% of templates currently marked Featured by an Admin appear in the
  homepage Featured carousel, and 0% of unfeatured templates appear there.
- **SC-003**: A Featured-state change made by one Admin is visible to another Admin
  viewing the same template list without requiring any manual cache clear or special
  action.

## Assumptions

- "Featured" is a simple boolean state per template (not a ranked/ordered list or
  time-bounded promotion) — consistent with US-6.1's description and the existing
  `GET /templates/featured` contract, which returns an unordered array.
- The admin template management screens already built under `src/features/admin`
  (per `specs/011-admin-content-management`) are the correct place to add this
  control — this feature extends that existing surface rather than introducing a new
  one.
- Any number of templates may be Featured simultaneously; curating the Featured
  carousel to a "reasonable" number is an editorial decision for Admins, not a system
  constraint enforced here.
- Featuring an unpublished (draft) template is allowed at the data level, but it will
  not appear publicly until published, matching how every other public template
  listing already treats draft templates.
