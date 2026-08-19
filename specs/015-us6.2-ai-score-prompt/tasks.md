---

description: "Task list for AI Score a Prompt (US-6.2)"
---

# Tasks: AI Score a Prompt

**Input**: Design documents from `/specs/015-us6.2-ai-score-prompt/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/score-endpoint.md, quickstart.md

**Tests**: Included — this project's constitution (V. Verified Before Done) and
`CLAUDE.md` mandate TDD; new hook/component logic gets unit tests mirroring the
existing `useRefinePrompt.test.ts`/`RefineTrigger.test.tsx`/`RefineDiffView.test.tsx`
pattern (Vitest + Testing Library, jsdom).

**Organization**: Tasks are grouped by user story (US1/US2 from spec.md) to enable
independent implementation and testing of each.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1/US2)
- File paths are exact and relative to the repo root

## Path Conventions

Single Vite/React SPA — all paths under `src/`, per plan.md's Project Structure.

---

## Phase 1: Setup

**Purpose**: Confirm the ground this feature builds on is in place; no new
infrastructure needed.

- [x] T001 Verify `src/features/ai-enhance/api/aiEnhanceClient.ts` (and
      `.types.ts`/`.mock.ts`/`.real.ts`) already export a working `score()` matching
      `contracts/score-endpoint.md` (real client hits `POST
      /generated-prompts/{id}/score`; mock client returns a deterministic
      `ScoreResult`) — no changes expected, this is a read-only sanity check before
      building on top of it (research.md's first two decisions).

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by both user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Define the score flow's state-machine types (`ScoreFlowState`: `idle` |
      `loading` | `result` | `error`, plus the `UseScorePromptOptions`/
      `UseScorePromptResult` shapes from data-model.md) in
      `src/features/ai-enhance/hooks/useScorePrompt.types.ts`.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Score a generated prompt (Priority: P1) 🎯 MVP

**Goal**: A logged-in User can click "Score this prompt" on a generated prompt and see
a 4-axis radar chart (clarity, specificity, context, format), an overall score, a
suggestions list, and a persistent disclaimer — with the trigger disabled while a
request is in flight and every documented error condition surfaced distinctly.

**Independent Test**: Per quickstart.md's User Story 1 section — generate (or open from
history) a prompt, click "Score this prompt", verify the radar chart + overall score +
suggestions + disclaimer render, and verify a second click while loading does not fire
a second request.

### Tests for User Story 1

- [x] T003 [P] [US1] Write failing tests for the `idle → loading → result` transition,
      the `score()` action's in-flight re-entrancy guard (FR-002), and the
      `RATE_LIMITED`/`AI_TIMEOUT`/`AI_UNAVAILABLE`/unmapped-error → message mapping
      (FR-008/FR-009) in `src/features/ai-enhance/hooks/useScorePrompt.test.ts`, using
      `createMockAiEnhanceClient` from `aiEnhanceClient.mock.ts`.
- [x] T004 [P] [US1] Write failing tests for `RadarChart` rendering exactly 4 labeled
      axes (clarity, specificity, context, format) on a 0–10 scale from a
      `ScoreBreakdown` prop in `src/features/ai-enhance/components/RadarChart.test.tsx`.
- [x] T005 [P] [US1] Write failing tests for `ScoreTrigger` (renders enabled for any
      logged-in owner with a `generatedPromptId`, per FR-001/the "no email-verification
      gate" assumption; disabled during `loading`; not rendered when
      `generatedPromptId` is null) in
      `src/features/ai-enhance/components/ScoreTrigger.test.tsx`.
- [x] T006 [P] [US1] Write failing tests for `ScoreResultView`'s read-only rendering
      (radar chart, overall score, suggestions list including the empty-suggestions
      case, and the "AI assessment for reference only" disclaimer always present per
      FR-005) in `src/features/ai-enhance/components/ScoreResultView.test.tsx`.

### Implementation for User Story 1

- [x] T007 [US1] Implement `useScorePrompt({ client, generatedPromptId })` in
      `src/features/ai-enhance/hooks/useScorePrompt.ts`: exposes `state`, `result`,
      `errorMessage`, and a `score()` action that transitions `idle → loading → result
      | error`, guards against a second call while `loading` (T003 must pass).
- [x] T008 [P] [US1] Implement `RadarChart` in
      `src/features/ai-enhance/components/RadarChart.tsx`: a small reusable inline-SVG
      4-axis radar chart (no new dependency, per research.md), taking a
      `ScoreBreakdown` prop and rendering axis labels + a filled polygon on a 0–10
      scale, themed with this app's existing light/dark CSS custom-property tokens
      (T004 must pass).
- [x] T009 [US1] Implement `ScoreTrigger` in
      `src/features/ai-enhance/components/ScoreTrigger.tsx`: a button matching
      `RefineTrigger.tsx`'s existing styling conventions, calling the hook's `score()`,
      disabled during `loading`, not rendered when `generatedPromptId` is null (T005
      must pass).
- [x] T010 [US1] Implement `ScoreResultView` in
      `src/features/ai-enhance/components/ScoreResultView.tsx`: renders `RadarChart`
      with the result's `breakdown`, the overall `score`, the `suggestions` list (with
      an empty-state message when the list is empty), and the "AI assessment for
      reference only" disclaimer directly alongside the score (T006 must pass).
- [x] T011 [US1] Wire `ScoreTrigger` + `ScoreResultView` into
      `src/features/template-generate/components/TemplateGenerateSection.tsx`: render
      next to the existing `RefineTrigger`/`RefineDiffView` slot, driven by
      `useScorePrompt({ client: aiEnhanceClient, generatedPromptId:
      generateResult?.generatedPromptId ?? null })`, gated only on `generateResult`
      existing (no `emailVerified` gate, per the "no email-verification gate"
      assumption).
- [x] T012 [US1] Wire the same components into
      `src/features/history/components/HistoryPromptDetail.tsx`, below the existing
      Refine UI, using the same `generatedPromptId` prop already threaded through this
      component.
- [x] T013 [US1] Add the score-specific error message mapping
      (`RATE_LIMITED`/`AI_TIMEOUT`/`AI_UNAVAILABLE`, plus a generic
      "Couldn't score this prompt, please try again" fallback for any unmapped code
      including a malformed/unparseable backend response) to `useScorePrompt.ts`,
      matching `useRefinePrompt.ts`'s `ERROR_MESSAGES` record pattern (contracts/
      score-endpoint.md's error table).

**Checkpoint**: User Story 1 is fully functional and testable independently — a user
can request a score and review the radar chart, overall score, suggestions, and
disclaimer on both surfaces.

---

## Phase 4: User Story 2 - Keep the score visible while reviewing the same prompt (Priority: P2)

**Goal**: A score result already on screen stays rendered through incidental
interaction with other controls on the same view (no re-fetch, no lost state), and
re-running "Score this prompt" replaces the displayed result with a fresh one.

**Independent Test**: Per quickstart.md's User Story 2 section — with a score result on
screen, click Copy (an unrelated control) and verify the score stays rendered
unchanged with no new loading state; then click "Score this prompt" again and verify
the result is replaced on success.

### Tests for User Story 2

- [x] T014 [P] [US2] Write a test confirming that re-invoking `score()` while
      `state === 'result'` transitions `result → loading → result` again and replaces
      the previous `ScoreResult` with the new one (FR-007) in
      `src/features/ai-enhance/hooks/useScorePrompt.test.ts`.
- [x] T015 [P] [US2] Write a test confirming an unrelated state update in the host
      component (e.g. `TemplateGenerateSection`'s Copy-button click handler firing)
      does not clear or re-fetch an already-rendered score result (FR-006) — extend
      `TemplateGenerateSection`'s existing test suite, or add a focused render test in
      `src/features/ai-enhance/components/ScoreResultView.test.tsx` asserting the
      result renders unchanged across an unrelated prop/state change in its parent.

### Implementation for User Story 2

- [x] T016 [US2] Confirm (no new production code expected) that FR-006 already holds
      by construction — `useScorePrompt`'s `result` lives in the same host component's
      local state as `ScoreTrigger`/`ScoreResultView`, so unrelated sibling
      interactions (e.g. Copy) never unmount or reset it. If T014/T015 reveal a gap
      (e.g. a stray `key` prop or conditional unmount clearing state), fix it in
      `TemplateGenerateSection.tsx` / `HistoryPromptDetail.tsx` at the smallest scope
      needed.

**Checkpoint**: Both user stories are independently functional — the full US-6.2 scope
(score → review → re-score, with the score staying put across unrelated interactions)
works end-to-end on both surfaces.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across both stories.

- [x] T017 [P] Run `npm run lint` and fix any findings across all files touched by this
      feature.
- [x] T018 [P] Run `npx tsc -b --noEmit` and fix any type errors.
- [x] T019 Run `npm run test` and confirm all new and existing tests pass.
- [x] T020 Manually exercise quickstart.md's validation scenarios in a running browser
      (`npm run dev`), including the four error-message cases (T013) and both
      light/dark themes for `RadarChart`/`ScoreResultView`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2.
- **User Story 2 (Phase 4)**: Depends on Foundational; extends the same
  `useScorePrompt.ts`/`ScoreResultView.tsx` files US1 creates, so in practice starts
  after US1's Checkpoint even though it introduces no new *user-facing* dependency on
  US1's behavior beyond that shared code (same pattern as US-6.1's US2/US3).
- **Polish (Phase 5)**: Depends on both user stories being complete.

### Within Each User Story

- Tests written and failing before implementation (T003–T006 before T007–T013, etc.).
- Hook logic before the components that consume it.
- Components before the integration-wiring tasks that render them.

### Parallel Opportunities

- T003, T004, T005, T006 (US1 tests, different files) can run in parallel.
- T008 (RadarChart) can be built in parallel with T007 (hook) since neither depends on
  the other's implementation, only on their respective tests.
- T014, T015 (US2 tests, different files) can run in parallel.
- T017, T018 (Polish) can run in parallel.
- Because US2 extends `useScorePrompt.ts` (a file US1 creates), US1 must finish first
  in practice — same real (not merely file-organizational) dependency noted in
  US-6.1's precedent (`specs/014-us6.1-ai-refine-prompt/tasks.md`).

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write failing tests for useScorePrompt in src/features/ai-enhance/hooks/useScorePrompt.test.ts"
Task: "Write failing tests for RadarChart in src/features/ai-enhance/components/RadarChart.test.tsx"
Task: "Write failing tests for ScoreTrigger in src/features/ai-enhance/components/ScoreTrigger.test.tsx"
Task: "Write failing tests for ScoreResultView in src/features/ai-enhance/components/ScoreResultView.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run quickstart.md's User Story 1 scenario in a browser.
5. Demo: users can score a prompt and see the full radar-chart result.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 → validate → demo (MVP).
3. Add User Story 2 → validate (Copy-doesn't-clear-score, re-score-replaces scenarios)
   → demo (full US-6.2 scope complete).
4. Phase 5 Polish → final `lint`/`tsc`/`test`/quickstart pass before reporting done.
