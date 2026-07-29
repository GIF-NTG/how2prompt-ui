# Feature Specification: Prompt History & Favorites

**Feature Branch**: `010-us4-prompt-history-favorites`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Implement Epic 4 — Prompt History & Favorites for registered Users, per how2prompt-agentic/docs/user-stories/us-4.1-*.md through us-4.5-*.md and agent/BA.md §2 (US-4.1–4.5): auto-save each successful /templates/{id}/generate call to history (no separate log call), a /history page filterable by template/model/date, reload a history item back onto the generate form (pre-fills input_values, creates a new record on re-generate rather than overwriting), favorite/unfavorite templates (toggleFavorite API already exists in templateClient/templateDetailClient — reuse it, don't reintroduce), and soft-delete history records."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View my prompt history (Priority: P1)

As a logged-in User, I navigate to a History page and see every prompt I've
previously generated, most recent first, so I can find and reuse past work
instead of re-typing it.

**Why this priority**: This is the entry point for the whole epic — without a
history list there is nothing to filter, reload, or delete. It also confirms
the auto-save behavior (US2, backend-only) is actually working end-to-end,
since the only way to observe a saved record from the frontend is this list.

**Independent Test**: Generate a prompt from an existing template, navigate to
`/history`, and confirm the new entry appears at the top of the list with its
template name, AI model, a snippet of the generated prompt, and the date.

**Acceptance Scenarios**:

1. **Given** I have generated 3 prompts in the past, **When** I open `/history`,
   **Then** I see all 3 listed, most recent first, each showing template
   name, AI model used, a prompt snippet, and the generation date.
2. **Given** I am on the History page, **When** I filter by a specific
   template, AI model, or date range, **Then** only matching entries remain
   in the list.
3. **Given** I have more history entries than fit on one page, **When** I
   reach the end of the list, **Then** I can load the next page of older
   entries without losing my current filters.
4. **Given** I have never generated a prompt, **When** I open `/history`,
   **Then** I see an empty-state message inviting me to browse the template
   library, not a blank page or an error.
5. **Given** I am a Guest (not logged in), **When** I try to open `/history`,
   **Then** I am redirected to log in, since history is scoped to a
   registered user's account.

---

### User Story 2 - Every generation is automatically saved (Priority: P1)

As a logged-in User, every time I successfully generate a prompt, it is saved
to my history without any extra action on my part, so I never lose a prompt
I've created.

**Why this priority**: This is the data foundation the rest of the epic reads
from. It ties directly into the existing Generate & Copy flow (Epic 3) rather
than adding a new save step, so it must be correct before History (US1),
Reload (US3), or Delete (US5) have anything meaningful to operate on.

**Independent Test**: Generate a prompt as a logged-in User and, without doing
anything else, refresh `/history` — the new entry is already there.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I successfully generate a prompt via an
   existing template, **Then** a history record is created automatically —
   no separate "save" button or action is needed.
2. **Given** I am a Guest, **When** I successfully generate a prompt (within
   the Guest quota), **Then** nothing is saved to any history, since history
   is a registered-User-only feature.
3. **Given** a generate request fails (validation error, quota exceeded,
   network error), **When** the failure occurs, **Then** no history record
   is created for that attempt.

---

### User Story 3 - Reload a prompt from history (Priority: P2)

As a logged-in User, I click "Re-run" on a history entry and the generate
form opens pre-filled with the inputs I used before, so I can tweak them and
generate a new version instead of starting from a blank form.

**Why this priority**: High value but depends on US1 (the list) existing
first; it is a refinement on top of the core history view rather than a
prerequisite for it.

**Independent Test**: From `/history`, click "Re-run" on any entry and verify
the generate form for that template opens with the same field values and AI
model already selected.

**Acceptance Scenarios**:

1. **Given** a history entry for a template that still exists, **When** I
   click "Re-run", **Then** I land on that template's generate form with
   every field pre-filled from the entry's saved inputs and the same AI model
   selected.
2. **Given** I reload a prompt from history and change one field, **When** I
   click Generate, **Then** a brand-new history entry is created and the
   original entry is left unchanged.
3. **Given** a history entry whose template has since been deleted, **When**
   I click "Re-run", **Then** I see a clear message that the template is no
   longer available and I cannot reload the form (I can still view/copy the
   saved prompt text itself).
4. **Given** a history entry whose template has a newer version than the one
   used at generation time, **When** I view that entry, **Then** I see an
   indicator that a newer version exists, and reloading uses the current
   (newer) form definition.

---

### User Story 4 - Favorite or unfavorite a template (Priority: P2)

As a logged-in User, I click the heart icon on a template card or detail
page to favorite it, so I can quickly get back to templates I use often.

**Why this priority**: Independently useful and already has a working backend
contract; it's grouped in this epic because it shares the "things I want to
get back to" theme with history, but it does not depend on US1-US3.

**Independent Test**: Click the heart icon on any template card, confirm it
switches to the filled/active state immediately, then reload the page and
confirm the state persisted.

**Acceptance Scenarios**:

1. **Given** I am logged in and viewing a template I have not favorited,
   **When** I click the heart icon, **Then** the icon switches to its
   favorited state immediately and the template's favorite count increases
   by one.
2. **Given** I have already favorited a template, **When** I click the heart
   icon again, **Then** it unfavorites and the count decreases by one.
3. **Given** I am a Guest, **When** I click a heart icon, **Then** I am
   prompted to log in rather than the action silently failing.
4. **Given** I have favorited templates, **When** I open my favorites list,
   **Then** I see all of them, and removing one from there also un-favorites
   it everywhere else it's shown.

---

### User Story 5 - Delete a history entry (Priority: P3)

As a logged-in User, I delete an entry from my history that I no longer want
to see, so my history list stays relevant to what I actually reuse.

**Why this priority**: Cleanup/housekeeping action — valuable but the least
critical of the five; the feature is usable without it.

**Independent Test**: From `/history`, delete one entry and confirm it
disappears from the list immediately and does not reappear after a page
refresh.

**Acceptance Scenarios**:

1. **Given** I am viewing my history, **When** I click delete on an entry and
   confirm the prompt, **Then** the entry is removed from the list right
   away.
2. **Given** I click delete but then cancel the confirmation, **When** I
   dismiss the dialog, **Then** the entry remains in my history unchanged.
3. **Given** I select several entries at once, **When** I choose "Delete
   selected", **Then** all selected entries are removed together after one
   confirmation.
4. **Given** an entry has been deleted, **When** I refresh `/history` or
   revisit it later, **Then** the deleted entry never reappears in the list.

---

### Edge Cases

- What happens when a User has zero history entries and zero favorites? Both
  views show a friendly empty state with a call-to-action back to the
  catalog, not an error or infinite loading spinner.
- How does the system handle a "Re-run" click on a history entry whose
  template was deleted after the prompt was generated? Show a clear
  unavailable-template message; block the form reload but still let the User
  view/copy the raw saved prompt text.
- How does filtering behave when a filter combination (template + model +
  date range) matches nothing? Show an empty-filtered-results state distinct
  from the true empty-history state, with an option to clear filters.
- What happens if the network fails mid-pagination (loading the next page of
  history)? Show an inline retry affordance for that page without discarding
  already-loaded entries above it.
- What happens if a User double-clicks a heart icon rapidly? The final
  displayed state must match the last click's intent (toggle is idempotent
  from the User's perspective) even if a request is still in flight.
- What happens if a User tries to delete a history entry that another
  concurrent session already deleted? Treat it as already-deleted — remove it
  from the list without showing an error.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST automatically create a history record for every
  successful prompt generation by a logged-in User, as part of the existing
  generate flow, with no separate save action required from the User.
- **FR-002**: The system MUST NOT create a history record for Guest
  generations or for failed generation attempts.
- **FR-003**: The system MUST provide a `/history` page, accessible only to
  logged-in Users, listing the current User's history entries sorted by
  generation date, most recent first.
- **FR-004**: Each history list entry MUST show at minimum: the template
  name, the AI model used, a short snippet of the generated prompt, and the
  generation date.
- **FR-005**: Users MUST be able to filter their history list by template, by
  AI model, and by a date range, in any combination.
- **FR-006**: The system MUST support paginating through history entries
  beyond the first page without losing the currently applied filters.
- **FR-007**: Users MUST be able to reload a history entry into its
  template's generate form, with the form pre-filled using the entry's
  originally saved input values and AI model selection.
- **FR-008**: Generating again from a reloaded history entry MUST create a
  new, separate history record; it MUST NOT modify or overwrite the original
  entry.
- **FR-009**: If a history entry's template no longer exists, the system MUST
  block the form-reload action and clearly communicate that the template is
  unavailable, while still allowing the User to view and copy the entry's
  saved prompt text.
- **FR-010**: If a history entry's template has a newer version than the one
  used at generation time, the system MUST indicate this to the User on that
  entry.
- **FR-011**: Users MUST be able to favorite and unfavorite a template from
  both the template card and the template detail view, reusing the existing
  favorite/unfavorite capability rather than introducing a new one.
- **FR-012**: The favorited/unfavorited state and the template's favorite
  count MUST update immediately in the UI when toggled, and MUST persist
  across page reloads.
- **FR-013**: Users MUST be able to view a list of all templates they have
  favorited, and unfavoriting from that list MUST also update the state
  everywhere else that template's favorite status is shown.
- **FR-014**: Users MUST be able to delete an individual history entry after
  an explicit confirmation step.
- **FR-015**: Users MUST be able to select multiple history entries and
  delete them together in one confirmed action.
- **FR-016**: Deleting a history entry MUST be a soft-delete — the entry MUST
  disappear from the User's history immediately and MUST NOT reappear on
  subsequent visits, but the underlying record is not required to be
  permanently, irrecoverably erased.
- **FR-017**: The system MUST prevent Guests from accessing `/history`,
  favoriting, or deleting history entries, redirecting unauthenticated
  access attempts to login.
- **FR-018**: All history and favorites actions MUST behave correctly for the
  currently authenticated User only — a User must never see or affect another
  User's history or favorites.

### Key Entities

- **History entry (generated prompt record)**: One past prompt generation
  belonging to a single User. Key attributes: which template and template
  version were used, which AI model, the input values submitted, any extra
  instructions, the final generated prompt text, and when it was created.
  Soft-deletable.
- **Favorite**: A link between a User and a template indicating the User
  marked it for quick access. A template also tracks a total favorite count
  visible to everyone.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A logged-in User can find and re-open any of their last 20
  generated prompts in under 15 seconds using the History page.
- **SC-002**: 100% of successful prompt generations by logged-in Users result
  in a visible history entry, with zero manual save steps.
- **SC-003**: Reloading a history entry into the generate form takes the User
  under 2 clicks from the History page.
- **SC-004**: Favoriting or unfavoriting a template reflects in the UI in
  under 500ms of perceived response time (optimistic update), independent of
  network latency.
- **SC-005**: Deleting one or several history entries removes them from view
  immediately, with no stale/reappearing entries on refresh in 100% of
  observed cases.

## Assumptions

- The backend already implements history persistence (auto-save on
  generation), the `GET /generated-prompts` list and `GET
  /generated-prompts/{id}` detail endpoints, `DELETE /generated-prompts/{id}`
  soft-delete, and the favorite/unfavorite endpoints, per
  `docs/api/openapi.yaml` — this feature is frontend-only: consuming those
  contracts, not defining new backend behavior.
- Pagination follows the existing catalog pattern (`page`/`size` query
  params + `PageMeta` response, per the OpenAPI contract) rather than the
  cursor-based approach mentioned in the source user story, since the
  checked-in OpenAPI spec is the project's authoritative wire contract and
  takes precedence over the user-story doc where they disagree.
- "Favorite/unfavorite a template" reuses the `toggleFavorite` client method
  that already exists in `templateClient` and `templateDetailClient` — this
  feature only needs to wire up any UI entry points (e.g. a favorites list
  page) not already present, not reimplement the toggle itself.
- A dedicated `/favorites` list page/view is in scope (US4, scenario 4) since
  the backend already exposes `GET /favorites`, even though it wasn't named
  explicitly in the initial feature description.
- Restoring a soft-deleted history entry (undo) is out of scope for this
  feature — the source user story marks that as a Phase 2 capability.
- Bulk delete confirmation is a single dialog for the whole selection, not a
  per-item confirmation loop.
