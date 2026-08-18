---

description: "Task list for AI Refine a Prompt (US-6.1)"
---

# Tasks: AI Refine a Prompt

**Input**: Design documents from `/specs/014-us6.1-ai-refine-prompt/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ai-refine.md, quickstart.md

**Tests**: Included — this project's constitution (V. Verified Before Done) and
`CLAUDE.md` mandate TDD; new hook/component logic gets unit tests mirroring the
existing `GenerateActions.test.tsx`/`DynamicForm.test.tsx` pattern (Vitest + Testing
Library, jsdom).

**Organization**: Tasks are grouped by user story (US1/US2/US3 from spec.md) to enable
independent implementation and testing of each.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1/US2/US3)
- File paths are exact and relative to the repo root

## Path Conventions

Single Vite/React SPA — all paths under `src/`, per plan.md's Project Structure.

---

## Phase 1: Setup

**Purpose**: Confirm the ground this feature builds on is in place; no new
infrastructure needed.

- [X] T001 Verify `src/features/ai-enhance/api/aiEnhanceClient.ts` (and
      `.types.ts`/`.mock.ts`/`.real.ts`) exist and export `refine`, `acceptRefine`,
      `discardRefine` matching `contracts/ai-refine.md` — no changes expected, this is
      a read-only sanity check before building on top of it.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by all three user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Define the refine flow's state-machine types (`RefineFlowState`: `idle` |
      `loading` | `result` | `error`, plus the `RefinementResult` shape from
      data-model.md) in `src/features/ai-enhance/hooks/useRefinePrompt.types.ts`.
- [X] T003 [P] Create the directory scaffold for
      `src/features/ai-enhance/components/` (no files yet — `RefineTrigger.tsx` and
      `RefineDiffView.tsx` are added per-story below).

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Ask AI to refine a generated prompt (Priority: P1) 🎯 MVP

**Goal**: A verified, logged-in User can click "Refine with AI" on a generated prompt
and see a diff view (original vs. refined + explanations), with the trigger disabled
while a request is in flight.

**Independent Test**: Per quickstart.md scenario 1 — generate a prompt, click "Refine
with AI", verify the diff view renders with explanations, and verify a second click
while loading does not fire a second request.

### Tests for User Story 1

- [X] T004 [P] [US1] Write failing tests for the `idle → loading → result` transition
      and the `refine()` action (including the in-flight re-entrancy guard from FR-003)
      in `src/features/ai-enhance/hooks/useRefinePrompt.test.ts`, using
      `createMockAiEnhanceClient` from `aiEnhanceClient.mock.ts`.
- [X] T005 [P] [US1] Write failing tests for `RefineTrigger` (renders enabled when
      eligible per FR-001, disabled during `loading`, hidden/disabled when
      `generatedPromptId` is null or `emailVerified` is false per FR-002) in
      `src/features/ai-enhance/components/RefineTrigger.test.tsx`.
- [X] T006 [P] [US1] Write failing tests for `RefineDiffView`'s read-only rendering
      (original prompt, refined prompt, explanations list) in
      `src/features/ai-enhance/components/RefineDiffView.test.tsx`.

### Implementation for User Story 1

- [X] T007 [US1] Implement `useRefinePrompt(generatedPromptId, accessToken)` in
      `src/features/ai-enhance/hooks/useRefinePrompt.ts`: wraps
      `createAiEnhanceClient(accessToken)`, exposes `state`, `result`, `errorMessage`,
      and a `refine()` action that transitions `idle → loading → result | error` and
      guards against a second call while `loading` (T004 must pass).
- [X] T008 [US1] Implement `RefineTrigger` in
      `src/features/ai-enhance/components/RefineTrigger.tsx`: a button matching the
      existing `GenerateActions.tsx` styling conventions, calling the hook's `refine()`,
      disabled during `loading`, not rendered when `generatedPromptId` is null or
      `emailVerified` is false (T005 must pass).
- [X] T009 [US1] Implement `RefineDiffView` in
      `src/features/ai-enhance/components/RefineDiffView.tsx`: side-by-side (or
      stacked-responsive) original vs. refined text plus a bulleted explanations list;
      Accept/Edit/Reject controls stubbed as no-ops for now (wired in US2/US3) (T006
      must pass).
- [X] T010 [US1] Wire `RefineTrigger` + `RefineDiffView` into
      `src/features/template-generate/components/TemplateGenerateSection.tsx`: render
      below the existing `GenerateActions` slot, driven by
      `useRefinePrompt(generateResult?.generatedPromptId, session?.token)`, gated on
      `generateResult` existing and `session?.emailVerified`.
- [X] T011 [US1] Wire the same components into
      `src/features/history/components/HistoryPromptDetail.tsx` (and thread
      `generatedPromptId`/`emailVerified` through from its call site in
      `src/features/history/components/HistoryList.tsx`), below the existing Copy
      button.
- [X] T012 [US1] Surface the five distinct refine error messages (FR-009:
      `AI_QUOTA_EXCEEDED`, `RATE_LIMITED`, `AI_TIMEOUT`, `AI_UNAVAILABLE`,
      `AI_CONTENT_FILTERED`) as user-facing copy in `useRefinePrompt.ts`'s error
      handling, matching the `GENERIC_ERROR_MESSAGE`/`QUOTA_ERROR_MESSAGE` pattern in
      `GenerateActions.tsx`.

**Checkpoint**: User Story 1 is fully functional and testable independently — a user
can request a refine and review the diff, but Accept/Edit/Reject are not yet wired to
persist anything.

---

## Phase 4: User Story 2 - Accept the refined version (Priority: P2)

**Goal**: From the diff view, the User can accept the refinement as-is, replacing the
prompt's displayed final text.

**Independent Test**: Per quickstart.md scenario 2 — with a diff view on screen, click
"Accept", verify the displayed/copyable prompt text becomes the refined version and the
diff view closes; verify the history detail view reflects the same change.

### Tests for User Story 2

- [X] T013 [P] [US2] Write failing tests for `useRefinePrompt`'s `acceptRefine()`
      action (`result → idle`, calls `aiEnhanceClient.acceptRefine` with no
      `acceptedPrompt` override, invokes the `onAccepted` callback with the refined
      text) in `src/features/ai-enhance/hooks/useRefinePrompt.test.ts`.

### Implementation for User Story 2

- [X] T014 [US2] Add `acceptRefine()` to `useRefinePrompt.ts`: calls
      `aiEnhanceClient.acceptRefine(generatedPromptId)`, transitions back to `idle` on
      success, and calls the hook's `onAccepted(refinedText: string)` callback prop
      (T013 must pass).
- [X] T015 [US2] Add the "Accept" control to `RefineDiffView.tsx`, invoking
      `acceptRefine()`.
- [X] T016 [US2] In `TemplateGenerateSection.tsx`, pass an `onAccepted` handler to
      `useRefinePrompt` that updates local `generateResult.finalPrompt`.
- [X] T017 [US2] In `HistoryList.tsx`'s `HistoryPromptDetail` call site, pass an
      `onAccepted` handler that updates `expandedDetail.finalPrompt` via
      `setExpandedDetail`.

**Checkpoint**: User Stories 1 AND 2 both work independently — refine + accept is a
complete, useful increment on its own.

---

## Phase 5: User Story 3 - Edit before accepting, or reject and keep the original (Priority: P3)

**Goal**: From the diff view, the User can hand-edit the refined text before accepting,
or reject the refinement outright.

**Independent Test**: Per quickstart.md scenarios 3–4 — edit the refined text and
accept, verify the final prompt matches the edit (not the AI's raw suggestion);
separately, click "Reject", verify the final prompt is unchanged from before refine was
requested.

### Tests for User Story 3

- [X] T018 [P] [US3] Write failing tests for `useRefinePrompt`'s `discardRefine()`
      action (`result → idle`, calls `aiEnhanceClient.discardRefine`, final prompt
      unchanged) in `src/features/ai-enhance/hooks/useRefinePrompt.test.ts`.
- [X] T019 [P] [US3] Write failing tests for `acceptRefine()` accepting an
      `editedPrompt` override (passes it through as `acceptedPrompt` to
      `aiEnhanceClient.acceptRefine`) in the same test file.
- [X] T020 [P] [US3] Write failing tests for `RefineDiffView`'s inline-edit control
      (editing the refined text updates what gets passed to Accept) in
      `RefineDiffView.test.tsx`.

### Implementation for User Story 3

- [X] T021 [US3] Add `discardRefine()` to `useRefinePrompt.ts`: calls
      `aiEnhanceClient.discardRefine(generatedPromptId)`, transitions back to `idle`
      without touching the prompt's final text (T018 must pass).
- [X] T022 [US3] Extend `acceptRefine()` in `useRefinePrompt.ts` to accept an optional
      edited-text argument and forward it as `acceptedPrompt` (T019 must pass).
- [X] T023 [US3] Add an editable text control to `RefineDiffView.tsx` for the refined
      side, and a "Reject" button calling `discardRefine()`; wire "Accept" to pass the
      edited text when it differs from the AI's original suggestion (T020 must pass).

**Checkpoint**: All three user stories are independently functional — the full US-6.1
flow (refine → review → accept/edit-then-accept/reject) works end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all three stories.

- [X] T024 [P] Run `npm run lint` and fix any findings across all files touched by this
      feature.
- [X] T025 [P] Run `npx tsc -b --noEmit` and fix any type errors.
- [X] T026 Run `npm run test` and confirm all new and existing tests pass.
- [X] T027 Manually exercise quickstart.md's six validation scenarios in a running
      browser (`npm run dev`), including the error-surface scenario (T012's five
      distinct messages).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Foundational; extends the same
  `useRefinePrompt.ts`/`RefineDiffView.tsx` files US1 creates, so in practice starts
  after US1's Checkpoint even though it introduces no new *user-facing* dependency on
  US1's behavior beyond that shared code.
- **User Story 3 (Phase 5)**: Same relationship — extends the files US1/US2 created.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### Within Each User Story

- Tests written and failing before implementation (T004–T006 before T007–T012, etc.).
- Hook logic before the components that consume it.
- Components before the integration-edit tasks that render them.

### Parallel Opportunities

- T004, T005, T006 (US1 tests, different files) can run in parallel.
- T013 (US2) has no sibling to parallelize with in its own phase.
- T018, T019, T020 (US3 tests, different files) can run in parallel.
- T024, T025 (Polish) can run in parallel.
- Because US2/US3 both edit `useRefinePrompt.ts` and `RefineDiffView.tsx` (files US1
  creates), US1 must finish first in practice — this is a real, not merely
  file-organizational, dependency for this feature, unlike the fully-independent-stories
  ideal in the tasks template.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run quickstart.md scenario 1 in a browser.
5. Demo: users can see a refine result, even though nothing persists yet.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 → validate → demo (MVP).
3. Add User Story 2 → validate (scenario 2) → demo (refine is now useful end-to-end).
4. Add User Story 3 → validate (scenarios 3–4) → demo (full US-6.1 scope complete).
5. Phase 6 Polish → final `lint`/`tsc`/`test`/quickstart pass before reporting done.
