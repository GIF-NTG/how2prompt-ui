---
description: 'Task list template for feature implementation'
---

# Tasks: Align Current UI With Approved Design Mockup

**Input**: Design documents from `/specs/006-align-ui-with-design-mockup/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Not requested in the feature spec — this is a presentation-only
restyle; verification is the existing automated test suite (regression check)
plus manual visual comparison against `docs/design/how2prompt-workspace-mockup.html`
per `quickstart.md`, not new test code.

**Organization**: Tasks are grouped by user story (from spec.md) so each story
can be restyled and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task's file path is repo-relative from `D:\WorkSpace\Github Clone Vô Đây\how2prompt-ui`

## Path Conventions

Single Vite/React SPA — all paths are under `src/` (see plan.md's Project
Structure). No `tests/` directory changes are needed for this feature.

---

## Phase 1: Setup

**Purpose**: Establish a known-green baseline before touching any styling, so
regressions introduced by this feature are unambiguous.

- [X] T001 Run `npm run lint`, `npm run build`, and `npm run test -- --run` at
      the repo root and confirm all three currently pass, establishing the
      pre-restyle baseline

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by every user story.

**Not applicable to this feature** — each user story's files are disjoint
(Catalog components, Template Detail components, and `TopBar.tsx` don't share
any code that needs updating first) and the design-token reference audit is
already complete in `research.md`. Proceed directly to Phase 3.

---

## Phase 3: User Story 1 - Catalog page matches the approved design (Priority: P1) 🎯 MVP

**Goal**: The catalog page (search, filter chips, model selector, Featured/
Trending rails, full grid) renders with the exact colors, typography, and
spacing from `docs/design/how2prompt-workspace-mockup.html`.

**Independent Test**: Load `/` in light and dark themes and compare directly
against the mockup's catalog view (`quickstart.md` step 3); every card, chip,
badge, and section header must match.

### Implementation for User Story 1

- [X] T002 [P] [US1] Remove the `uppercase` class from the "Chính thức"
      official badge and fix the light-theme favorite/danger hex from
      `#C23A2A` to `#C23A2E` in
      `src/features/home/components/TemplateCard.tsx` (research.md drift #1, #2)
- [X] T003 [P] [US1] Verify `src/features/home/components/SearchBox.tsx`
      against the mockup's `.search-box` rule (surface bg, `--line` border,
      12px radius, `--ink-faint` placeholder/glyph); adjust only if a
      discrepancy is found — research.md found none (confirmed: exact match, no change)
- [X] T004 [P] [US1] Verify `src/features/home/components/FilterBar.tsx`
      against the mockup's `.chip` and `.model-select` rules (pill shape,
      `--accent`-filled pressed state, `--line` border); adjust only if a
      discrepancy is found — research.md found none (confirmed via ModelFilter.tsx
      and TagFilterChips.tsx: exact match, no change)
- [X] T005 [P] [US1] Verify `src/features/home/components/TemplateRail.tsx`
      against the mockup's `.rail`/`.section-head` rules (0.9rem gap, 240px min
      card width, mono/`--ink-faint` count label); adjust only if a
      discrepancy is found — research.md found none (confirmed: exact match, no change)
- [X] T006 [P] [US1] Verify `src/features/home/components/TemplateGrid.tsx`
      against the mockup's `.template-grid`/`.section-head` rules
      (`repeat(auto-fill, minmax(240px, 1fr))`, 1rem gap); adjust only if a
      discrepancy is found — research.md found none (confirmed: exact match, no change)
- [X] T007 [P] [US1] Verify `src/features/home/pages/CatalogPage.tsx` against
      the mockup's `.page-head` rule (title/lede sizing, gap, max-width); adjust
      only if a discrepancy is found — research.md found none (confirmed: exact match, no change)
- [X] T008 [US1] Manually verify the catalog page against
      `docs/design/how2prompt-workspace-mockup.html` in light and dark themes
      per `quickstart.md` step 3, confirming SC-001 (depends on T002-T007)
      (verified via Playwright screenshots, light + dark, zero console errors —
      badge case fix confirmed, no other visual drift)

**Checkpoint**: Catalog page fully matches the design reference and is
independently shippable.

---

## Phase 4: User Story 2 - Template detail page matches the approved design (Priority: P2)

**Goal**: The template detail page (hero, category badges, model tags, usage
guide, example output, meta/actions) matches the design reference's visual
style, using the nearest existing design pattern where the mockup has no
literal detail-only view (research.md, "mockup coverage gaps" #1).

**Independent Test**: Open any `/templates/:slug` page in light and dark
themes and compare each section against the design reference per
`quickstart.md` step 4.

### Implementation for User Story 2

- [X] T009 [P] [US2] Remove the `uppercase` class from the "Chính thức"
      official badge in
      `src/features/template-detail/components/TemplateHero.tsx`
      (research.md drift #1)
- [X] T010 [P] [US2] Verify `src/features/template-detail/components/ModelTags.tsx`
      against the mockup's `.model-tag` rule (mono, 0.68rem, `--ink-faint`,
      `--surface-2` background); adjust only if a discrepancy is found —
      research.md found none (confirmed: exact match, no change)
- [X] T011 [P] [US2] Align the card to 14px border radius and `1.1rem 1.2rem`
      padding (matching `.output-box`) in
      `src/features/template-detail/components/UsageGuide.tsx`
      (research.md drift #5)
- [X] T012 [P] [US2] Align the card to 14px border radius and `1.1rem 1.2rem`
      padding (matching `.output-box`) in
      `src/features/template-detail/components/ExampleOutput.tsx`
      (research.md drift #5)
- [X] T013 [P] [US2] Fix the light-theme favorite/danger hex from `#C23A2A`
      to `#C23A2E` and reduce the usage-count text to `0.7rem` in
      `src/features/template-detail/components/TemplateMeta.tsx`
      (research.md drift #2, #6)
- [X] T014 [P] [US2] Switch the back-link to monospace, underlined text at
      `0.8rem` (matching `.back-link`) in
      `src/features/template-detail/components/BackLink.tsx`
      (research.md drift #4)
- [X] T015 [P] [US2] Verify `src/features/template-detail/components/NotFoundState.tsx`
      against the mockup's `.empty-state` rule (`--ink-faint`, 0.88rem,
      centered); adjust only if a discrepancy is found (confirmed: mockup has no
      literal 404/not-found reference — component already uses approved tokens
      only, no change)
- [X] T016 [P] [US2] Verify `src/features/template-detail/components/TemplateDetailPage.tsx`
      layout/spacing against the mockup's `.page-head`/`.detail-layout`
      conventions; adjust only if a discrepancy is found (found: top padding was
      `pt-8` (2rem) vs the mockup's `.app-main` `0.5rem` top padding — fixed to
      `pt-2` across all three render branches)
- [X] T017 [US2] Manually verify the template detail page against
      `docs/design/how2prompt-workspace-mockup.html` in light and dark themes
      per `quickstart.md` step 4, confirming SC-002 (depends on T009-T016)
      (verified via Playwright screenshots, light + dark, zero console errors —
      badge case, card radius/padding, back-link typography, usage-count size,
      and top-padding fixes all confirmed)

**Checkpoint**: Template detail page fully matches the design reference,
independently of User Story 1.

---

## Phase 5: User Story 3 - Shared navigation shell matches the approved design (Priority: P3)

**Goal**: The top navigation bar matches the design reference's structure and
styling for both the guest and signed-in states, consistently across every
screen.

**Independent Test**: Compare the rendered top navigation bar (guest and
signed-in, both themes) against the mockup's topbar per `quickstart.md` step 5.

### Implementation for User Story 3

- [X] T018 [US3] Add a hover border-bottom in `--ink-faint`
      (`#8B8F86` light / `#6D726A` dark) to the "Thư viện"/"Lịch sử" nav links
      and add the missing `dark:border-b-[#6D726A]` to the active-route state
      in `src/shared/components/TopBar.tsx` (research.md drift #3)
- [X] T019 [US3] Manually verify the top navigation bar (guest and signed-in
      states) against `docs/design/how2prompt-workspace-mockup.html` in light
      and dark themes per `quickstart.md` step 5, confirming SC-003 (depends
      on T018) (verified: nav-link hover border-bottom computed style resolves
      to `rgb(139, 143, 134)` = `#8B8F86` (`--ink-faint`) exactly, matching the
      design reference; guest state unchanged and already compliant)

**Checkpoint**: All three user stories independently match the design
reference.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm no functional regression was introduced and close out the
feature's success criteria.

- [X] T020 [P] Run `npm run lint` at the repo root and fix any issues
      introduced by the restyle tasks above (clean — 0 issues in `src/`)
- [X] T021 [P] Run `npm run build` at the repo root and fix any type/build
      errors introduced by the restyle tasks above (build succeeded)
- [X] T022 [P] Run `npm run test -- --run` at the repo root and confirm 100%
      of existing tests still pass, confirming SC-004 and FR-007 (no
      behavioral regression) (36/36 passed)
- [X] T023 Run the full `quickstart.md` validation end-to-end (all of
      SC-001–SC-004, light and dark themes) and capture before/after
      screenshots of the catalog page, a template detail page, and the topbar
      for the PR description (depends on T008, T017, T019, T020, T021, T022)
      — all four success criteria confirmed; see T008/T017/T019/T020-T022 notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run first.
- **Foundational (Phase 2)**: N/A for this feature — no blocking shared work.
- **User Stories (Phase 3-5)**: Each can start immediately after Phase 1;
  they touch entirely disjoint files (Catalog components vs. Template Detail
  components vs. `TopBar.tsx`) so they may proceed in parallel or in priority
  order (P1 → P2 → P3).
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on US2/US3.
- **User Story 2 (P2)**: No dependency on US1/US3.
- **User Story 3 (P3)**: No dependency on US1/US2.

### Within Each User Story

- All per-component fix/verify tasks are `[P]` (different files) and may run
  in any order.
- The story's manual visual-verification task always runs last, after every
  fix/verify task in that story.

### Parallel Opportunities

- T002-T007 (User Story 1) can all run in parallel.
- T009-T016 (User Story 2) can all run in parallel.
- Stories 1, 2, and 3 can be worked on in parallel by different people, since
  they share no files.
- T020, T021, T022 (Polish) can all run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch all component fix/verify tasks for User Story 1 together:
Task: "Fix badge case + danger hex in src/features/home/components/TemplateCard.tsx"
Task: "Verify SearchBox.tsx against .search-box tokens"
Task: "Verify FilterBar.tsx against .chip/.model-select tokens"
Task: "Verify TemplateRail.tsx against .rail/.section-head tokens"
Task: "Verify TemplateGrid.tsx against .template-grid/.section-head tokens"
Task: "Verify CatalogPage.tsx against .page-head tokens"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 3: User Story 1 (Catalog).
3. **STOP and VALIDATE**: run T008, confirm SC-001 holds.
4. Ship the catalog restyle alone if desired — it delivers value independently.

### Incremental Delivery

1. Setup → baseline confirmed green.
2. User Story 1 (Catalog) → verify independently → ship (MVP).
3. User Story 2 (Template Detail) → verify independently → ship.
4. User Story 3 (TopBar) → verify independently → ship.
5. Polish → full regression + quickstart validation → close out the feature.

### Parallel Team Strategy

With multiple developers: after Setup, one developer takes US1, another US2,
another US3 — no file overlap, so they integrate without conflict. Polish runs
once all three stories are done.

---

## Notes

- `[P]` tasks touch different files and have no dependency on an incomplete
  task in the same phase.
- Every fix task cites the specific `research.md` drift item it resolves, so
  the diff stays scoped to what was actually audited — no unrelated styling
  changes.
- "Verify" tasks exist because research.md's audit, while thorough, wasn't
  exhaustive down to every CSS property; if a verify task does find drift,
  fix it using the token table in `research.md` and note the addition in the
  PR description.
- Commit after each user story phase (or per task, per team preference) —
  each story is independently shippable per spec.md's story design.
