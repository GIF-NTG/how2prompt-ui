---
description: 'Task list template for feature implementation'
---

# Tasks: Admin & Content Management

**Input**: Design documents from `/specs/011-admin-content-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-api.md, quickstart.md

**Tests**: Colocated `*.test.tsx`/`*.test.ts` tasks are included below, matching this
repo's existing convention (every shipped feature/page/component has a colocated
test) and Constitution Principle V ("Verified Before Done"). They are not written as
strict pre-implementation TDD gates — the checklist rule making tests optional per
feature-spec request applies, but omitting them here would deviate from established
repo convention for no reason.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Single frontend project — all paths are relative to the repo root, under `src/`.

---

## Phase 1: Setup

**Purpose**: Scaffold the new feature folder; no new dependencies needed (plan.md
Technical Context — no new runtime dependency required for this feature).

- [X] T001 Create the `src/features/admin/` feature-folder skeleton
      (`components/`, `pages/`, `api/`, `utils/` subdirectories) per
      `plan.md`'s Project Structure section

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `isAdmin` session flag and the route guard that every one of the four
admin screens depends on. **No user story work can begin until this phase is
complete.**

- [X] T002 Extend `Session` in `src/features/auth/api/types.ts` with `isAdmin: boolean`
      (research.md Decision 1)
- [X] T003 [P] Add `isAdmin` to the mock account fixture and seed a second admin demo
      account in `src/features/auth/api/authClient.mock.ts`; include `isAdmin` in
      every constructed `Session` (login, restoreSession, etc.)
- [X] T004 [P] Add `isAdmin` to `BackendUser`/session construction in
      `src/features/auth/api/authClient.real.ts` (`toSession()` now reads
      `profile.isAdmin`)
- [X] T005 Create the `RequireAdmin` route guard in
      `src/features/admin/components/RequireAdmin.tsx`: render nothing while
      `isRestoring`, redirect to `/login` if `session` is null, redirect to `/` if
      `!session.isAdmin`, otherwise render `<Outlet />` (research.md Decision 2)
      (depends on T002)
- [X] T006 [P] Add colocated test
      `src/features/admin/components/RequireAdmin.test.tsx` covering: unauthenticated
      → redirected to `/login`; authenticated non-admin → redirected to `/`;
      authenticated admin → renders `Outlet`; `isRestoring` → renders nothing
      (depends on T005)
- [X] T007 Add a conditional "Admin" nav entry to `src/shared/components/TopBar.tsx`,
      visible only when `session?.isAdmin` is true (depends on T002)

**Checkpoint**: `isAdmin` flows through session restore/login, `RequireAdmin` blocks
non-admins, and the nav surfaces the entry point — every user story below can now
proceed independently.

---

## Phase 3: User Story 1 - Manage the AI Model Catalog (Priority: P1) 🎯 MVP

**Goal**: Admin can create, edit, and deactivate AI model catalog entries; changes
reflect immediately in model-selection dropdowns elsewhere in the app.

**Independent Test**: Log in as Admin, go to `/admin/ai-models`, create a model,
verify it's selectable in the template-generation model dropdown, then edit and
deactivate it — per `quickstart.md` §2.

### Implementation for User Story 1

- [X] T008 [P] [US1] Define `AiModel`/`AiModelUpsert` types in
      `src/features/admin/api/aiModelsClient.types.ts` per `data-model.md`
- [X] T009 [P] [US1] Implement the mock AI models client (in-memory fixtures incl. one
      active, one inactive, one template-referenced model; `list`/`create`/`update`)
      in `src/features/admin/api/aiModelsClient.mock.ts`
- [X] T010 [US1] Implement the real AI models client against
      `GET/POST /admin/ai-models` and `PATCH /admin/ai-models/{id}`
      (`contracts/admin-api.md`) in `src/features/admin/api/aiModelsClient.real.ts`
      (depends on T008)
- [X] T011 [US1] Create the mock/real client switch in
      `src/features/admin/api/aiModelsClient.ts`, following the existing
      `isApiConfigured()` pattern (depends on T009, T010)
- [X] T012 [P] [US1] Build `AiModelForm` (create/edit: code, name, provider,
      modelType, capabilities, iconUrl, isActive, sortOrder) in
      `src/features/admin/components/AiModelForm.tsx`
- [X] T013 [P] [US1] Build `AiModelTable` (list incl. inactive, edit + deactivate
      actions — **no delete action**, per research.md Decision 3) in
      `src/features/admin/components/AiModelTable.tsx`
- [X] T014 [US1] Build `AiModelsPage` wiring `AiModelTable` + `AiModelForm` to the
      client in `src/features/admin/pages/AiModelsPage.tsx` (depends on T011, T012,
      T013)
- [X] T015 [P] [US1] Add colocated test
      `src/features/admin/pages/AiModelsPage.test.tsx` covering create, edit,
      deactivate, and confirming no delete control is rendered (depends on T014)
- [X] T016 [US1] Add the `/admin/ai-models` route, nested under `RootLayout` and
      wrapped in `RequireAdmin`, in `src/app/App.tsx` (depends on T005, T014)

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Organize Categories & Tags (Priority: P1)

**Goal**: Admin manages a nested category tree; tag management is surfaced as a known
limitation (no admin tag endpoints exist yet — research.md Decision 3).

**Independent Test**: Log in as Admin, go to `/admin/taxonomy`, create a nested
category, verify it appears in the public catalog's filter controls, and confirm the
tag-management area shows the "not yet available" note — per `quickstart.md` §3.

### Implementation for User Story 2

- [X] T017 [P] [US2] Define `Category`/`CategoryUpsert`/read-only `Tag` types in
      `src/features/admin/api/taxonomyClient.types.ts` per `data-model.md`
- [X] T018 [P] [US2] Implement the mock taxonomy client (nested category fixtures,
      read-only tag list; `list`/`create`/`update` for categories) in
      `src/features/admin/api/taxonomyClient.mock.ts`
- [X] T019 [US2] Implement the real taxonomy client against
      `POST/PATCH /admin/categories` plus the existing public category-read endpoint
      (`contracts/admin-api.md`) in `src/features/admin/api/taxonomyClient.real.ts`
      (depends on T017)
- [X] T020 [US2] Create the mock/real client switch in
      `src/features/admin/api/taxonomyClient.ts` (depends on T018, T019)
- [X] T021 [P] [US2] Build `CategoryTree` (collapsible nested tree view; create/edit
      incl. re-parenting; client-side guard against selecting a category as its own
      ancestor, per `data-model.md`) in
      `src/features/admin/components/CategoryTree.tsx`
- [X] T022 [P] [US2] Build `TagManagementNotice` (static "tag management is not yet
      available" notice, still displaying existing tags read-only) in
      `src/features/admin/components/TagManagementNotice.tsx`
- [X] T023 [US2] Build `TaxonomyPage` wiring `CategoryTree` + `TagManagementNotice` to
      the client in `src/features/admin/pages/TaxonomyPage.tsx` (depends on T020,
      T021, T022)
- [X] T024 [P] [US2] Add colocated test
      `src/features/admin/pages/TaxonomyPage.test.tsx` covering nested category
      create/edit/re-parent and the tag notice's presence (depends on T023)
- [X] T025 [US2] Add the `/admin/taxonomy` route, nested under `RootLayout` and
      wrapped in `RequireAdmin`, in `src/app/App.tsx` (depends on T005, T023)

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Create & Publish Official Templates (Priority: P1)

**Goal**: Admin authors a template (title/description i18n, prompt body, variables,
optional model variants), saves as draft, and publishes it — blocked if any
`{{placeholder}}` lacks a matching declared variable; editing a published template
creates a new version.

**Independent Test**: Log in as Admin (with a model and category already available
from US1/US2), create a template, confirm publish is blocked on an undeclared
placeholder, add the variable, publish, and verify it's live on the public catalog —
per `quickstart.md` §4.

### Implementation for User Story 3

- [X] T026 [P] [US3] Define `Template`/`TemplateUpsert`/`TemplateVariable`/publish
      response types in
      `src/features/admin/api/templatesAdminClient.types.ts` per `data-model.md`
- [X] T027 [P] [US3] Implement the mock templates-admin client (draft/publish state
      machine; editing a published template produces a new version rather than
      overwriting) in `src/features/admin/api/templatesAdminClient.mock.ts`
- [X] T028 [US3] Implement the real templates-admin client against
      `POST/PATCH /admin/templates` and `POST /admin/templates/{id}/publish`
      (`contracts/admin-api.md`) in
      `src/features/admin/api/templatesAdminClient.real.ts` (depends on T026)
- [X] T029 [US3] Create the mock/real client switch in
      `src/features/admin/api/templatesAdminClient.ts` (depends on T027, T028)
- [X] T030 [P] [US3] Build a placeholder-vs-declared-variable validation util
      (mirrors the placeholder-parsing logic already in
      `src/features/template-generate/utils/renderTemplate.ts`) in
      `src/features/admin/utils/validatePlaceholders.ts`
- [X] T031 [P] [US3] Add colocated test
      `src/features/admin/utils/validatePlaceholders.test.ts` covering matched,
      missing, and extra-unused-variable cases (depends on T030)
- [X] T032 [P] [US3] Build `TemplateVariableEditor` (declare/reorder variables:
      varKey, label i18n, inputType, options, validation, sortOrder) in
      `src/features/admin/components/TemplateVariableEditor.tsx`
- [X] T033 [US3] Build `TemplateEditorForm` (title/description i18n, cover image,
      category/tag/model selectors, prompt body editor, variables via
      `TemplateVariableEditor`, optional per-model variants, guide, example output,
      Save Draft / Publish actions running the T030 validation before calling
      publish) in `src/features/admin/components/TemplateEditorForm.tsx` (depends on
      T030, T032)
- [X] T034 [US3] Build `TemplatesAdminPage` (list drafts/published templates +
      create/edit flow) wiring `TemplateEditorForm` to the client in
      `src/features/admin/pages/TemplatesAdminPage.tsx` (depends on T029, T033)
- [X] T035 [P] [US3] Add colocated test
      `src/features/admin/pages/TemplatesAdminPage.test.tsx` covering: publish
      blocked on a missing variable with the offending placeholder surfaced, publish
      succeeds once declared, and editing a published template produces a new
      version (depends on T034)
- [X] T036 [US3] Add the `/admin/templates` route, nested under `RootLayout` and
      wrapped in `RequireAdmin`, in `src/app/App.tsx` (depends on T005, T034)

**Checkpoint**: User Stories 1, 2, and 3 (all P1) are complete and independently
functional — this is the full MVP per spec.md's priority assignment.

---

## Phase 6: User Story 4 - View the Analytics Dashboard (Priority: P2)

**Goal**: Admin views DAU/WAU/MAU, prompts-generated-over-time, top templates, and
top models, filterable by a custom date range (no conversion-funnel metric yet — see
research.md Decision 3).

**Independent Test**: Log in as Admin, go to `/admin/dashboard`, confirm metrics
render, then apply a custom date range and confirm the figures update — per
`quickstart.md` §5.

### Implementation for User Story 4

- [X] T037 [P] [US4] Define the `DashboardMetricSnapshot` type (per `data-model.md`,
      omitting the conversion funnel) in
      `src/features/admin/api/dashboardClient.types.ts`
- [X] T038 [P] [US4] Implement the mock dashboard client with non-empty fixture
      metrics that vary with the requested date range in
      `src/features/admin/api/dashboardClient.mock.ts`
- [X] T039 [US4] Implement the real dashboard client against
      `GET /admin/dashboard/stats?from&to` (`contracts/admin-api.md`) in
      `src/features/admin/api/dashboardClient.real.ts` (depends on T037)
- [X] T040 [US4] Create the mock/real client switch in
      `src/features/admin/api/dashboardClient.ts` (depends on T038, T039)
- [X] T041 [P] [US4] Build `DateRangeFilter` in
      `src/features/admin/components/DateRangeFilter.tsx`
- [X] T042 [P] [US4] Build `DashboardMetrics` (DAU/WAU/MAU tiles, prompts-over-time,
      top-templates and top-models tables/bars using existing Tailwind utilities —
      no new charting dependency per plan.md) in
      `src/features/admin/components/DashboardMetrics.tsx`
- [X] T043 [US4] Build `DashboardPage` wiring `DateRangeFilter` + `DashboardMetrics`
      to the client in `src/features/admin/pages/DashboardPage.tsx` (depends on T040,
      T041, T042)
- [X] T044 [P] [US4] Add colocated test
      `src/features/admin/pages/DashboardPage.test.tsx` covering metrics rendering
      and date-range-triggered updates (depends on T043)
- [X] T045 [US4] Add the `/admin/dashboard` route, nested under `RootLayout` and
      wrapped in `RequireAdmin`, in `src/app/App.tsx` (depends on T005, T043)

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide verification gates (Constitution Principle V) and closing out
the documented scope gaps.

- [X] T046 [P] Run `npm run lint` and fix any findings across `src/features/admin/**`
- [X] T047 [P] Run `npx tsc -b && npm run build` and fix any type errors across
      `src/features/admin/**` and the touched `auth`/`shared` files
- [X] T048 Run `npm run test` (full suite) and fix any failures
- [ ] T049 Execute the full `quickstart.md` manual browser walkthrough (all 5
      sections) against the running dev server and confirm every "Expected" outcome
- [X] T050 [P] Update CLAUDE.md's Epic 5 bullet to note the frontend is now
      implemented, cross-referencing the three documented backend-gap follow-ups
      (AI-model/category delete, admin tag endpoints, conversion funnel — research.md
      Decision 3) for future tracking

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational (Phase 2) completion;
  independent of each other thereafter
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 — AI Models)**: No dependency on other stories
- **User Story 2 (P1 — Taxonomy)**: No dependency on other stories
- **User Story 3 (P1 — Templates)**: Functionally richer to demo with a model and
  category already created (US1/US2), but not code-dependent on either — its client
  and components are self-contained
- **User Story 4 (P2 — Dashboard)**: No dependency on other stories; more interesting
  to view once US1-3 have produced real activity, but not code-dependent on them

### Within Each User Story

- Types before mock/real clients
- Mock + real clients before the client switch
- Client switch + components before the page
- Page before its route registration
- Story complete before moving to the next priority (if working sequentially)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (there's only T001 here)
- T003 and T004 (Phase 2) can run in parallel — different files
- Once Phase 2 completes, all four user story phases (3-6) can be worked in parallel
  by different developers/agents
- Within each story: the `*.types.ts` and mock-client tasks marked [P] can run in
  parallel with each other; component-building tasks marked [P] can run in parallel
  with each other

---

## Parallel Example: User Story 1

```bash
# Launch client-layer tasks for User Story 1 together:
Task: "Define AiModel/AiModelUpsert types in src/features/admin/api/aiModelsClient.types.ts"
Task: "Implement the mock AI models client in src/features/admin/api/aiModelsClient.mock.ts"

# Once types+mock exist, launch component tasks together:
Task: "Build AiModelForm in src/features/admin/components/AiModelForm.tsx"
Task: "Build AiModelTable in src/features/admin/components/AiModelTable.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3, all P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (AI Models) — smallest independently-shippable slice
4. **STOP and VALIDATE**: Run `quickstart.md` §1-2 against User Story 1 alone
5. Complete Phase 4 (Taxonomy) and Phase 5 (Templates) — the spec assigns all three
   P1, so the real MVP is Stories 1-3 together, not Story 1 alone
6. Deploy/demo once Stories 1-3 pass their independent tests

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. User Story 1 → validate independently → optional early demo
3. User Story 2 → validate independently
4. User Story 3 → validate independently → full P1 MVP reached
5. User Story 4 (P2) → validate independently → fast-follow, not required for MVP
6. Phase 7 Polish → run before calling the whole feature done

### Parallel Team Strategy

With multiple developers/agents, once Phase 2 (Foundational) is done:

- Developer A: User Story 1 (AI Models)
- Developer B: User Story 2 (Taxonomy)
- Developer C: User Story 3 (Templates)
- Developer D: User Story 4 (Dashboard)

All four touch `src/app/App.tsx` only for their own route-registration task (T016,
T025, T036, T045) — coordinate that single-line addition to avoid merge conflicts,
everything else is in disjoint files.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete same-phase work
- [Story] label maps every user-story-phase task to its story for traceability
- No delete/merge UI is generated for AI models, categories, or tags, and no
  conversion-funnel UI is generated for the dashboard — these are named, tracked
  contract gaps (research.md Decision 3), not omissions to fix silently later
- Commit after each task or logical group, per repo convention
- Stop at any checkpoint to validate a story independently before continuing
