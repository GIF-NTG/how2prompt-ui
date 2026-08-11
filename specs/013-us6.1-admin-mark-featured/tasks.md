---
description: 'Task list template for feature implementation'
---

# Tasks: Admin Mark Template as Featured

**Input**: Design documents from `/specs/013-us6.1-admin-mark-featured/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-templates-featured.md, quickstart.md

**Tests**: Included, following this codebase's existing convention of a Testing Library
test file per admin page/component (see `TemplatesAdminPage.test.tsx`) and Constitution
Principle V ("Verified Before Done" — `vitest` must pass).

**Organization**: Tasks are grouped by user story (US1/US2 = P1, US3 = P2, per spec.md)
to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact, relative to the repository root.

---

## Phase 1: Setup

**Purpose**: Confirm the documented wire contract this feature builds against is
already in place.

- [X] T001 Verify `isFeatured` exists on `TemplateListItem` and `TemplateUpsert` in
      `docs/api/openapi.yaml` (already added in a prior session — no action needed
      if present; add it if missing, per `contracts/admin-templates-featured.md`).

**Checkpoint**: No further setup — this feature extends an already-scaffolded admin
feature area (`src/features/admin`), no new project/dependency init required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the shared admin-template types and both API clients
(real + mock) with the `isFeatured` field. Every user story's UI work depends on
this data being available on `TemplateUpsert`/`AdminTemplate`.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Add `isFeatured: boolean` to `TemplateUpsert` and `AdminTemplate` in
      `src/features/admin/api/templatesAdminClient.types.ts` (per data-model.md).
- [X] T003 Default `isFeatured: false` in `emptyForm()` in
      `src/features/admin/components/TemplateEditorForm.tsx` (depends on T002 for
      the type to compile).
- [X] T004 [P] In `src/features/admin/api/templatesAdminClient.real.ts`: add
      optional `isFeatured?: boolean` to `RawTemplateDetail`, map it to
      `AdminTemplate.isFeatured` via `raw.isFeatured ?? false` in
      `mapAdminTemplate`, and include `isFeatured: input.isFeatured` in the body
      built by `patchMetadata` so both `create()` and `update()` send it (per
      contracts/admin-templates-featured.md field mapping).
- [X] T005 [P] In `src/features/admin/api/templatesAdminClient.mock.ts`: include
      `isFeatured: input.isFeatured` in the object built by `toAdminTemplate` so
      the mock client round-trips the flag the same way the real one does.

**Checkpoint**: `TemplateUpsert`/`AdminTemplate` carry `isFeatured` end-to-end
through both API clients — user story UI work can now begin.

---

## Phase 3: User Story 1 - Mark a template as Featured (Priority: P1) 🎯 MVP

**Goal**: An Admin can turn a template's "Featured" flag on from the edit form and
have it saved.

**Independent Test**: Log in as Admin, open a template's edit form, toggle
"Featured" on, save, and confirm (a) the admin UI shows the new state without a
reload and (b) the template appears in the homepage's Featured carousel.

### Implementation for User Story 1

- [X] T006 [US1] Add a "Featured" checkbox control to the form in
      `src/features/admin/components/TemplateEditorForm.tsx`, bound to
      `form.isFeatured` / `setForm((f) => ({ ...f, isFeatured: e.target.checked }))`,
      placed near the existing category/tag/model fieldsets, following the same
      `FIELD_CLASSES`-adjacent label pattern already used in that file.
- [X] T007 [US1] Confirm `handleSaveDraft` in `TemplateEditorForm.tsx` already
      submits the full `form` object (including `isFeatured`) via `onSaveDraft` —
      no change needed if so; if the submit path narrows the payload anywhere,
      widen it to include `isFeatured`.

### Tests for User Story 1

- [X] T008 [P] [US1] In `src/features/admin/pages/TemplatesAdminPage.test.tsx` (or
      a new `TemplateEditorForm.test.tsx` if one doesn't already exist), add a test
      that toggles "Featured" on in the edit form and asserts the mocked
      `templatesAdminClient.update`/`create` is called with `isFeatured: true`.

**Checkpoint**: User Story 1 is fully functional and independently testable — an
Admin can feature a template and it becomes visible on the homepage (via the
already-existing `GET /templates/featured` read path, per research.md Decision 3).

---

## Phase 4: User Story 2 - Unmark a template as Featured (Priority: P1)

**Goal**: An Admin can turn an already-featured template's flag back off from the
edit form and have it saved.

**Independent Test**: Take an already-featured template, open its edit form
(confirm the "Featured" checkbox shows checked), toggle it off, save, and confirm
it disappears from the homepage's Featured carousel.

### Implementation for User Story 2

- [X] T009 [US2] In `src/features/admin/components/TemplateEditorForm.tsx`'s
      `useEffect` that syncs `form` from `editingTemplate`, populate
      `isFeatured: editingTemplate.isFeatured` so the checkbox added in T006
      correctly reflects the template's current state when the edit form opens
      (depends on T002, T006).

### Tests for User Story 2

- [X] T010 [P] [US2] Add a test asserting that opening the edit form for a
      template with `isFeatured: true` renders the "Featured" checkbox as checked,
      and that toggling it off and saving calls `templatesAdminClient.update` with
      `isFeatured: false`.

**Checkpoint**: User Stories 1 AND 2 both work independently — the same toggle
control now correctly supports both marking and unmarking.

---

## Phase 5: User Story 3 - See current Featured status at a glance (Priority: P2)

**Goal**: The admin template list visually distinguishes Featured templates from
non-Featured ones.

**Independent Test**: Feature one template (via Story 1), leave others unfeatured,
open `/admin/templates`, and confirm only the featured one shows a "Featured"
badge.

### Implementation for User Story 3

- [X] T011 [US3] In `src/features/admin/pages/TemplatesAdminPage.tsx`'s table row
      rendering, add a small "Featured" badge next to the existing
      published/draft status badge when `template.isFeatured` is `true` (reuse the
      existing conditional-`className` badge pattern already used for `status`).

### Tests for User Story 3

- [X] T012 [P] [US3] In `src/features/admin/pages/TemplatesAdminPage.test.tsx`, add
      a test asserting the "Featured" badge renders for a template with
      `isFeatured: true` and is absent for one with `isFeatured: false`.

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification per Constitution Principle V.

- [X] T013 Run `npm run lint`, `npm run build` (`tsc -b && vite build`), and
      `npm run test`; fix any failures surfaced by the new `isFeatured` field or
      test additions.
- [X] T014 Manually execute `quickstart.md`'s validation steps in a running browser
      (`npm run dev`): mark a template Featured, confirm it appears in the
      homepage carousel; unmark it, confirm it disappears; confirm the admin list
      badge tracks the state; confirm a draft template can be featured without
      appearing publicly until published.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 is a documentation-consistency check.
- **Foundational (Phase 2)**: Depends on Phase 1. BLOCKS all user stories — T006–T012
  all require `isFeatured` to exist on `TemplateUpsert`/`AdminTemplate` (T002) first.
- **User Stories (Phase 3–5)**: All depend on Foundational (Phase 2) completion.
  - US1 (Phase 3) has no dependency on US2/US3.
  - US2 (Phase 4) reuses the checkbox US1 adds (T006) — build T006 before T009, but
    US2 remains independently *testable* once both are in place (per spec.md, US1
    and US2 are two acceptance directions of the same control, not two separate
    features).
  - US3 (Phase 5) only depends on `AdminTemplate.isFeatured` (T002/T004/T005), not
    on US1/US2's form changes — could be built in parallel with Phase 3/4 by a
    different developer.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Parallel Opportunities

- T004 and T005 (real vs. mock client) touch different files — run in parallel.
- T008, T010, T012 (test tasks for different stories) can be written in parallel
  once their respective implementation tasks land.
- Phase 5 (US3) can proceed in parallel with Phase 3/4 (US1/US2) since it only
  depends on the Foundational phase, not on the form changes.

---

## Parallel Example: Foundational Phase

```bash
# After T002 (types) and T003 (emptyForm default) land:
Task: "Add isFeatured mapping to templatesAdminClient.real.ts (T004)"
Task: "Add isFeatured passthrough to templatesAdminClient.mock.ts (T005)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 — mark Featured).
3. **STOP and VALIDATE**: an Admin can feature a template and see it on the
   homepage. This alone is a usable, demoable increment even before Stories 2/3
   land (unfeaturing would still require a direct backend action, which is
   acceptable only as a temporary MVP checkpoint, not a shipping state — Story 2
   is required before this feature is considered done per spec.md's Priority P1
   on both stories).

### Incremental Delivery

1. Setup + Foundational → shared `isFeatured` plumbing ready.
2. Add User Story 1 → test independently → mark-as-Featured works end-to-end.
3. Add User Story 2 → test independently → unmark-as-Featured works end-to-end
   (completes the MVP — both P1 stories done).
4. Add User Story 3 → test independently → admin list badge (P2 polish).
5. Phase 6 → lint/build/test + manual quickstart validation.

## Notes

- The mock client's `getFeatured()` (`src/features/home/api/templateClient.mock.ts`)
  currently derives the featured set from `isOfficial`, not `isFeatured` — this is
  a pre-existing demo-only simplification unrelated to the real contract and is
  intentionally left unchanged (out of scope, no FR requires it); the real client's
  `getFeatured()` already calls the backend's own `GET /templates/featured`
  correctly, per research.md Decision 3.
- [P] tasks touch different files with no ordering dependency.
- [Story] labels map every Phase 3+ task to its spec.md user story for traceability.
- Commit after each task or logical group, per this repo's CLAUDE.md convention of
  only committing when asked — do not auto-commit mid-implementation.
