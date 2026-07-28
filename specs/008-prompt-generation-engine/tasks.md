---
description: 'Task list template for feature implementation'
---

# Tasks: Prompt Generation Engine

**Input**: Design documents from `/specs/008-prompt-generation-engine/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/generate-endpoint.md, quickstart.md

**Tests**: Not explicitly requested in the feature spec, but included per this
repo's established convention (a test file per new hook/util/page — see
`templateClient.mock.test.ts`, `CatalogPage.test.tsx`) and per Constitution
Principle V.

**Organization**: Tasks are grouped by user story, in spec.md's priority
order (US1, US2, US3 are all P1; US4 is P2). Per `plan.md`'s parallel-work
split: **Developer A owns US1 + US4**, **Developer B owns US2 + US3** — every
task below is tagged with its owner so the two-person split from the team's
planning discussion maps directly onto this file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an
  incomplete task)
- **[Story]**: US1/US2/US3/US4 per spec.md
- Paths are repo-relative from `D:\WorkSpace\Github Clone Vô Đây\how2prompt-ui`

## Path Conventions

Single Vite/React SPA. New feature directory: `src/features/template-generate/`
(see plan.md's Project Structure). One existing file is touched
(`src/features/template-detail/components/TemplateDetailPage.tsx`, one new
mount point only).

---

## Phase 1: Setup

- [ ] T001 Run `npm run lint`, `npm run build`, and `npm run test -- --run`
      at the repo root and confirm all three currently pass, establishing
      the pre-feature baseline

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared contract both developers build on — types, the
`useGenerateForm` state hook, the `generateClient` skeleton, and the mount
point into the existing detail page. Per `research.md`, this MUST be done
and merged to the shared feature branch **before** Developer A and Developer
B fork into their own branches — it is the single point of coupling between
their halves.

**⚠️ CRITICAL**: Whoever does this (one person, or both together) must land
it first. Do not start US1–US4 work before this phase is merged.

- [ ] T002 [P] Create `src/features/template-generate/types.ts` with
      `TemplateVariable`, `TemplateVariableOption`, and `TemplateVariant`
      (camelCase, matching `docs/api/openapi.yaml` exactly per
      research.md's contract-mismatch decision — data-model.md)
- [ ] T003 [P] Create `src/features/template-generate/api/generateClient.types.ts`
      with `GenerateRequest`/`GenerateResponse` (data-model.md,
      contracts/generate-endpoint.md)
- [ ] T004 Extend `TemplateVersion` in
      `src/features/template-detail/types.ts` with `variables:
      TemplateVariable[]` and `variants: TemplateVariant[]` (depends on T002;
      data-model.md)
- [ ] T005 Add `variables`/`variants` values to
      `MOCK_TEMPLATE.current_version` in
      `src/features/template-detail/api/templateDetailClient.mock.ts` — at
      least 3 variables spanning text/select/number/boolean per
      quickstart.md's prerequisites (depends on T004)
- [ ] T006 [P] Create `src/features/template-generate/utils/guestFingerprint.ts`
      — generates and persists a random UUID in `localStorage`, returns the
      same value on every call (research.md's guest-fingerprint decision)
- [ ] T007 Create `src/features/template-generate/api/generateClient.mock.ts`
      with a working success path only (echo `inputValues` substituted into
      the mock template's `prompt_body`) — quota/failure simulation is added
      later in US3 (T023) (depends on T002, T003)
- [ ] T008 Create `src/features/template-generate/api/generateClient.real.ts`
      — `POST /templates/{id}/generate` via `apiFetch`, attaching
      `X-Guest-Fingerprint` from T006 when no session token is present
      (depends on T003, T006; contracts/generate-endpoint.md)
- [ ] T009 Create `src/features/template-generate/api/generateClient.ts`
      (mock/real switch, mirroring `templateClient.ts`'s existing pattern)
      (depends on T007, T008)
- [ ] T010 Create `src/features/template-generate/hooks/useGenerateForm.ts`
      implementing `GenerateFormState` + per-field validation +
      variant-aware `activeVariables` recomputation on model change,
      preserving still-applicable `inputValues` (depends on T002, T004;
      data-model.md's state-transition rules)
- [ ] T011 Create `src/features/template-generate/components/TemplateGenerateSection.tsx`
      (owns `useGenerateForm`, renders placeholder slots for the A/B pieces
      below) and mount `<TemplateGenerateSection templateSlug={slug} />`
      below the existing read-only content in
      `src/features/template-detail/components/TemplateDetailPage.tsx`
      (depends on T009, T010)

**Checkpoint**: Shared contract compiles and mounts. Merge to the shared
feature branch; both developers branch off this commit.

---

## Phase 3: User Story 1 - Fill in a template's inputs through a guided form (Priority: P1) 🎯 MVP — Developer A

**Goal**: Model selection + a dynamic form rendering one correctly-typed,
validated control per template variable.

**Independent Test**: Open a template, select a model, fill every required
input, confirm "Generate" only becomes available once every required input
is valid (quickstart.md step 2).

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create `src/features/template-generate/components/ModelVariantSelect.tsx`
      — dropdown over the template's `supported_models`, hidden and
      auto-selected when only one model is supported (spec.md Acceptance
      Scenario 1.2/1.3)
- [ ] T013 [P] [US1] Create `src/features/template-generate/components/FormField.tsx`
      — one control per `inputType` (text, textarea, select, multiselect,
      number, boolean, slider), plain-text-input fallback for any other enum
      value (date/file/url/color), i18n label/placeholder/help text, inline
      validation message from `useGenerateForm`'s `errors`
- [ ] T014 [US1] Create `src/features/template-generate/components/DynamicForm.tsx`
      — maps `activeVariables` to `FormField` instances, sorted by
      `sortOrder` (depends on T012, T013)
- [ ] T015 [US1] Wire `ModelVariantSelect` and `DynamicForm` into the
      designated slots of `TemplateGenerateSection.tsx` (depends on T014;
      touches the shared container file — keep this a small, additive
      change to avoid conflicting with Developer B's own wiring task)
- [ ] T016 [US1] Add test cases in
      `src/features/template-generate/components/DynamicForm.test.tsx`
      covering: one control per variable type renders; a required-but-empty
      field keeps Generate disabled; a regex/min/max violation keeps
      Generate disabled and shows the inline error; **(C2 — analyze finding)**
      switching the target model when both models' variable sets share a
      `varKey` preserves that field's already-entered value, and clears/
      resets only the fields that don't exist in the new model's variant
      (FR-012)
- [ ] T017 [US1] Manually verify against `quickstart.md` step 2 (form
      rendering, validation gating, model-switch variable preservation),
      confirming the relevant parts of spec.md's Acceptance Scenarios

**Checkpoint**: User Story 1 is independently demonstrable (form fills in
and validates) even before Preview/Generate exist.

---

## Phase 4: User Story 2 - See the prompt take shape while filling the form (Priority: P1) — Developer B

**Goal**: A live, client-side-only preview that updates on every form change.

**Independent Test**: Change form fields one at a time, confirm the preview
updates immediately with unfilled required spots visually distinguished
(quickstart.md step 3).

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create `src/features/template-generate/utils/renderTemplate.ts`
      — substitutes `{{varKey}}` in the active `prompt_body` with current
      `inputValues`, returns unfilled placeholders as a distinct marker the
      UI can style separately (pure function, no React)
- [ ] T019 [US2] Create `src/features/template-generate/components/PreviewPanel.tsx`
      — monospace rendering of `renderTemplate`'s output, unfilled spots
      visually distinct, character count + token estimate shown alongside
      (depends on T018)
- [ ] T020 [US2] Wire `PreviewPanel` into `TemplateGenerateSection.tsx`'s
      designated slot (depends on T019; small additive change, same
      conflict-avoidance note as T015)
- [ ] T021 [US2] Add test cases in
      `src/features/template-generate/utils/renderTemplate.test.ts`
      covering: filled placeholder substitution, unfilled placeholder
      marking, and multiselect/boolean value formatting
- [ ] T022 [US2] Manually verify against `quickstart.md` step 3 (live
      update with no network activity, unfilled-spot styling, size
      indicator), confirming SC-003

**Checkpoint**: Preview works standalone on top of US1's form, independent
of whether Generate (US3) exists yet.

---

## Phase 5: User Story 3 - Generate the final prompt and copy it (Priority: P1) — Developer B

**Goal**: Trigger the authoritative backend render, display and copy the
result, handle guest quota and system errors.

**Independent Test**: With a fully valid form, generate and confirm the
displayed result comes from the backend response (not the client preview);
confirm quota/error paths render clearly (quickstart.md step 5).

### Implementation for User Story 3

- [ ] T023 [US3] Extend `src/features/template-generate/api/generateClient.mock.ts`
      (from T007) with a simulated guest-quota-exceeded path and a simulated
      generic-failure path, both toggleable for dev/testing (contracts/generate-endpoint.md)
- [ ] T024 [P] [US3] Create `src/features/template-generate/components/GenerateActions.tsx`
      — Generate button (disabled per `useGenerateForm.state.isValid`),
      Copy button with confirmation toast, and an error banner branching on
      `ApiError.code`/`status` (`GUEST_QUOTA_EXCEEDED` message vs. generic
      retry message) (depends on T023)
- [ ] T025 [P] [US3] Create `src/features/template-generate/components/OutputBox.tsx`
      — displays `GenerateResponse.finalPrompt` once generation succeeds
- [ ] T026 [US3] Wire `GenerateActions` and `OutputBox` into
      `TemplateGenerateSection.tsx`'s designated slot, calling
      `generateClient.generate(...)` and holding the `GenerateResponse`
      result in local state (depends on T024, T025; same
      conflict-avoidance note as T015/T020)
- [ ] T027 [US3] Add test cases in
      `src/features/template-generate/components/GenerateActions.test.tsx`
      covering: success shows `finalPrompt` and a working Copy button;
      `GUEST_QUOTA_EXCEEDED` shows the quota message; a generic failure
      shows a retry-able generic message and no fabricated result;
      **(C1 — analyze finding)** for a signed-in (authenticated) generate
      call, the mock response's `generatedPromptId` is non-null, and for an
      unauthenticated (guest) call it is `null` — asserting the FE surfaces
      whatever the mock returns rather than assuming either case (FR-009)
- [ ] T028 [US3] Manually verify against `quickstart.md` step 5 (generate
      uses the authoritative response, not the preview; copy confirmation;
      guest quota message; generic-failure handling), confirming FR-006,
      FR-009–FR-011, SC-001, SC-004, SC-005

**Checkpoint**: All three P1 stories work together — a visitor can now go
from opening a template to holding a copied, correctly generated prompt.

---

## Phase 6: User Story 4 - Add free-form instructions on top of the template (Priority: P2) — Developer A

**Goal**: Optional free-form text appended to the generated result.

**Independent Test**: Generate once with the field empty (no effect), once
with text (text appears appended) (quickstart.md step 4).

### Implementation for User Story 4

- [ ] T029 [US4] Create `src/features/template-generate/components/ExtraInstructionsField.tsx`
      — optional textarea bound to `useGenerateForm.state.extraInstructions`
- [ ] T030 [US4] Wire `ExtraInstructionsField` into `TemplateGenerateSection.tsx`'s
      designated slot, below the dynamic form (depends on T029; same
      conflict-avoidance note as T015)
- [ ] T031 [US4] Manually verify against `quickstart.md` step 4 (empty vs.
      filled field effect on the generated result), confirming FR-005

**Checkpoint**: All four user stories complete and demonstrable together.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T032 [P] Run `npm run lint` at the repo root and fix any issues
      introduced above
- [ ] T033 [P] Run `npm run build` at the repo root and fix any type/build
      errors introduced above
- [ ] T034 [P] Run `npm run test -- --run` at the repo root and confirm
      100% pass, including every new test file from T016/T021/T027
- [ ] T035 Run the full `quickstart.md` validation end-to-end (all of
      spec.md's Acceptance Scenarios, SC-001–SC-005) in a running browser
      against the mock client, exercising the complete form → preview →
      generate → copy flow together (depends on T017, T022, T028, T031,
      T032, T033, T034)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run first.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks every user story**
  — lands on the shared feature branch before either developer forks off.
- **User Stories (Phase 3-6)**: All depend on Foundational. US1/US4
  (Developer A) and US2/US3 (Developer B) touch disjoint *new* files and can
  proceed fully in parallel on separate branches; each phase's final "wire
  into `TemplateGenerateSection.tsx`" task is the only place both
  developers touch the same file (see the note below).
- **Polish (Phase 7)**: Depends on all four user stories being complete and
  merged back together — T035 specifically requires the whole flow to exist
  at once.

### User Story Dependencies

- **US1 (P1, Developer A)**: Depends only on Foundational.
- **US2 (P1, Developer B)**: Depends only on Foundational — does not need
  US1's components to exist to build/test `renderTemplate.ts` and
  `PreviewPanel.tsx` in isolation (feed them synthetic state in tests).
- **US3 (P1, Developer B)**: Depends only on Foundational for its own
  implementation; T028's *manual* verification benefits from US1 existing
  (need a real form to fill in) but that's a verification-time convenience,
  not a build dependency.
- **US4 (P2, Developer A)**: Depends only on Foundational.

### Shared-file note (`TemplateGenerateSection.tsx`)

T015 (US1), T020 (US2), T026 (US3), and T030 (US4) each add one designated
slot's contents to the same container file. T011 (Foundational) should leave
those four slots clearly separated (e.g. distinct named sections/comments)
so each of these four tasks is a small, additive, low-conflict diff — this
is the one file both developers will touch, so whoever finishes first
should push/merge promptly and the other rebase, rather than both holding
large uncommitted diffs against it.

### Parallel Opportunities

- T002, T003, T006 (Foundational) can run in parallel.
- T012, T013 (US1) can run in parallel.
- T024, T025 (US3) can run in parallel.
- **Developer A's entire US1 + US4 track and Developer B's entire US2 + US3
  track can run in parallel** once Foundational is merged — this is the
  main parallel opportunity the team asked for.
- T032, T033, T034 (Polish) can run in parallel.

---

## Parallel Example: Post-Foundational split

```bash
# Developer A, on their own branch off the Foundational commit:
Task: "ModelVariantSelect.tsx"
Task: "FormField.tsx"
Task: "DynamicForm.tsx"
# ...through T017, then later T029-T031 (US4)

# Developer B, on their own branch off the same Foundational commit:
Task: "renderTemplate.ts"
Task: "PreviewPanel.tsx"
# ...through T022, then T023-T028 (US3)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (required — nothing else can start
   without it).
3. Complete Phase 3: User Story 1 (Developer A).
4. **STOP and VALIDATE**: run T017, confirm the form alone is correct.
5. A form that fills in and validates is demonstrable even before preview
   or generation exist — a legitimate incremental milestone.

### Two-Developer Parallel Delivery (recommended for this feature)

1. One person (or both together) completes Setup + Foundational → merge to
   the shared feature branch.
2. Developer A branches off and works US1 → US4 (Phases 3, 6).
3. Developer B branches off the same commit and works US2 → US3 (Phases 4,
   5) — starts at the same time as Developer A, not after.
4. Both merge back into the feature branch; whoever merges second resolves
   the small `TemplateGenerateSection.tsx` diff (see the shared-file note
   above).
5. Together: Phase 7 Polish — full flow exercised end-to-end, since this is
   the first point the whole feature exists at once.

---

## Notes

- `[P]` tasks touch different files and have no dependency on an incomplete
  task in the same phase.
- Every task cites the specific `research.md`/`data-model.md`/
  `contracts/generate-endpoint.md` decision it implements.
- Commit after each checkpoint; push the Foundational commit promptly so
  both developers can branch off the same base.
