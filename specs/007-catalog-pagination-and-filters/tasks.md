---
description: 'Task list template for feature implementation'
---

# Tasks: Complete Catalog Browsing (Pagination, Sort, Category/Tag Filters)

**Input**: Design documents from `/specs/007-catalog-pagination-and-filters/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/templates-list.md, quickstart.md

**Tests**: Not explicitly requested in the feature spec, but `plan.md`'s
Testing section commits to extending the existing `CatalogPage.test.tsx`
smoke test with cases for the new behavior — included below, one test task
per story, plus the existing suite as a regression gate in Polish.

**Organization**: Tasks are grouped by user story so each story can be
implemented and verified independently once the shared Foundational layer is
in place.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an
  incomplete task)
- **[Story]**: US1/US2/US3 per spec.md
- Paths are repo-relative from `D:\WorkSpace\Github Clone Vô Đây\how2prompt-ui`

## Path Conventions

Single Vite/React SPA — all paths under `src/` (see plan.md's Project
Structure). No new directories.

---

## Phase 1: Setup

- [X] T001 Run `npm run lint`, `npm run build`, and `npm run test -- --run`
      at the repo root and confirm all three currently pass, establishing
      the pre-feature baseline

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The corrected pagination contract, the new `tags` data field,
and the mock client's filtering/sort/pagination logic are shared by all
three user stories — none of them can be honestly implemented or verified
without this layer in place first (see research.md's contract-fix decision).

**⚠️ CRITICAL**: Complete this phase before starting any user story phase.

- [X] T002 [P] Replace `PageInfo` with `PageMeta` (`{ page, size,
      totalElements, totalPages, hasNext, hasPrevious }`) in
      `src/shared/types/api.ts`, matching `docs/api/openapi.yaml`'s
      `PageMeta` schema exactly (data-model.md)
- [X] T003 [P] Add `tags: Tag[]` to `TemplateListItem` and remove the unused
      `CatalogPageData` type in `src/features/home/types.ts` (data-model.md)
- [X] T004 Update `getTemplates`'s params (`page?: number`, `size?: number`
      replacing `cursor?: string`) and return type (`{ data, meta: PageMeta
      }` replacing `{ data, page_info, total_count }`) in
      `src/features/home/api/templateClient.types.ts` (depends on T002;
      data-model.md)
- [X] T005 Update `getTemplates` in
      `src/features/home/api/templateClient.real.ts` to send `page`/`size`
      query params and read the response as `{ data, meta: PageMeta }` per
      `contracts/templates-list.md` (depends on T004)
- [X] T006 [P] Add a `MOCK_TAGS: Tag[]` array and a `tags: Tag[]` value (1-2
      tags) on each `MOCK_TEMPLATES` entry in
      `src/features/home/api/templateClient.mock.ts` (depends on T003;
      data-model.md)
- [X] T007 In `src/features/home/api/templateClient.mock.ts`'s
      `getTemplates`, implement: independent `category` filtering (by
      `t.categories`) separate from `tags` filtering (by the new `t.tags`);
      sort application (`popular` → `usage_count` desc, `newest` →
      `created_at` desc) before official-first stable partitioning;
      `page`/`size` slicing producing a real `PageMeta` (`hasNext = (page +
      1) * size < totalElements`); and implement `getTags()` to return
      `MOCK_TAGS` (optionally filtered by `params?.q`) instead of `[]`
      (depends on T004, T006; research.md's sort/official-first/Category-Tag
      decisions)

**Checkpoint**: Contract, types, and mock logic are correct — user story UI
wiring can now begin.

---

## Phase 3: User Story 1 - Visitor browses the entire library (Priority: P1) 🎯 MVP

**Goal**: "Toàn bộ thư viện" supports real pagination (load more until every
matching template has been shown) with official templates always listed
first.

**Independent Test**: Seed/verify mock data exceeds one page, load the
catalog, and confirm a visitor can advance through every page via "Xem
thêm", with official templates always ahead of non-official ones
(`quickstart.md` step 2).

### Implementation for User Story 1

- [X] T008 [US1] Add a "Xem thêm" load-more control to
      `src/features/home/components/TemplateGrid.tsx`, rendered only when
      the current `meta.hasNext` is true, calling an `onLoadMore` prop
- [X] T009 [US1] In `src/features/home/pages/CatalogPage.tsx`, add `page`
      state and an accumulated-templates array; wire `onLoadMore` to fetch
      `page + 1` with the current filters/sort and append results; reset to
      `page = 0` and clear the accumulator whenever `q`, `model`,
      `category`, `tag`, or `sort` changes (depends on T008, and on
      Foundational T002-T007)
- [X] T010 [US1] Add test cases to
      `src/features/home/pages/CatalogPage.test.tsx` covering: "Xem thêm"
      appears when `hasNext` is true and disappears once exhausted; loaded
      templates accumulate across clicks without duplicates; official
      templates render ahead of non-official ones
- [X] T011 [US1] Manually verify pagination and official-first ordering
      against `quickstart.md` step 2, confirming SC-001 and SC-003
      (verified via Playwright against the real mock client with PAGE_SIZE
      temporarily lowered to 2: "Xem thêm" appears while pages remain and
      disappears once all 5 mock templates are loaded; the highest-usage
      non-official template — 600 lượt dùng, higher than every official one
      — still renders last, confirming official-first overrides popularity)

**Checkpoint**: User Story 1 is fully functional and independently
shippable (MVP).

---

## Phase 4: User Story 2 - Visitor chooses the sort order (Priority: P1)

**Goal**: A visible control lets the visitor switch "Toàn bộ thư viện"
between "Phổ biến nhất" and "Mới nhất", preserving active filters and
resetting pagination.

**Independent Test**: Load the catalog, switch the sort control, and
confirm the grid re-orders and pagination restarts from page one, with any
active filter preserved (`quickstart.md` step 3).

### Implementation for User Story 2

- [ ] T012 [US2] Add a sort `<select>` (Phổ biến nhất / Mới nhất) to
      `src/features/home/components/FilterBar.tsx`, styled per the existing
      `.model-select` token pattern
- [ ] T013 [US2] Add `sort: 'popular' | 'newest'` URL-synced state
      (`?sort=`, default `'popular'`) to
      `src/features/home/hooks/useCatalogFilters.ts`
- [ ] T014 [US2] In `src/features/home/pages/CatalogPage.tsx`, wire the
      selected sort value into the `getTemplates` call and trigger the
      pagination reset from T009 whenever `sort` changes (depends on T009,
      T012, T013)
- [ ] T015 [US2] Add test cases to
      `src/features/home/pages/CatalogPage.test.tsx` covering: selecting
      "Mới nhất" re-orders the grid and resets to page one; an active filter
      survives a sort change
- [ ] T016 [US2] Manually verify sort switching against `quickstart.md` step
      3, confirming SC-002

**Checkpoint**: User Stories 1 and 2 both work independently and together.

---

## Phase 5: User Story 3 - Visitor filters by Category and by Tag independently (Priority: P1)

**Goal**: Category and Tag become two independent, composable filter
controls, each deep-linkable via its own URL query parameter, replacing
today's single control that is mis-wired to Category data under a "tag"
parameter.

**Independent Test**: Select a Category, then separately select a Tag,
confirm the grid narrows by both (AND logic), then clear one and confirm the
other still applies alone; reload a URL with both params set and confirm
the exact same filtered view restores (`quickstart.md` step 4).

### Implementation for User Story 3

- [ ] T017 [US3] Add a `category: string` URL-synced state (`?category=`) to
      `src/features/home/hooks/useCatalogFilters.ts` alongside the existing
      `tag` field, and repoint `tag` to represent the Tag filter (not
      Category) going forward (depends on T013, same file)
- [ ] T018 [US3] Generalize
      `src/features/home/components/TagFilterChips.tsx` into a reusable
      chip-group component parameterized by `{ items, value, onChange,
      label }`, preserving its current visual/ARIA behavior
- [ ] T019 [US3] In `src/features/home/components/FilterBar.tsx`, compose
      two chip-group instances — one fed by `getCategories()` driving
      `category`, one fed by `getTags()` driving `tag` — alongside the
      existing model filter and the sort control from T012 (depends on
      T012, T018)
- [ ] T020 [US3] In `src/features/home/pages/CatalogPage.tsx`, pass
      `category: queryKey.category` and `tags: queryKey.tag` to
      `getTemplates` (previously both were incorrectly sent as `tags`), and
      include `category`/`tag` in the pagination-reset dependency list from
      T009/T014 (depends on T014, T017, T019)
- [ ] T021 [US3] Add test cases to
      `src/features/home/pages/CatalogPage.test.tsx` covering: selecting a
      Category and a Tag together narrows results with AND logic; clearing
      one preserves the other; loading a URL with both params pre-selects
      both filters
- [ ] T022 [US3] Manually verify Category/Tag composition and URL
      deep-linking against `quickstart.md` step 4, confirming SC-004 and
      SC-005

**Checkpoint**: All three user stories work independently and in
combination.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T023 [P] Run `npm run lint` at the repo root and fix any issues
      introduced above
- [ ] T024 [P] Run `npm run build` at the repo root and fix any type/build
      errors introduced above
- [ ] T025 [P] Run `npm run test -- --run` at the repo root and confirm
      100% pass, including the new cases from T010/T015/T021
- [ ] T026 Run the full `quickstart.md` validation end-to-end (SC-001
      through SC-005) in a running browser against the mock client (depends
      on T011, T016, T022, T023, T024, T025)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run first.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks every user story**
  — the contract fix, `tags` field, and mock filtering/sort/pagination logic
  are shared prerequisites, not story-specific work.
- **User Stories (Phase 3-5)**: All depend on Foundational completion. They
  are functionally independent of each other, but note the file-overlap
  caveat below before assuming fully parallel team execution.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational.
- **User Story 2 (P1)**: Depends on Foundational; T014 also depends on US1's
  T009 (reuses its pagination-reset mechanism) — implement US1 first if a
  single person is doing this sequentially.
- **User Story 3 (P1)**: Depends on Foundational; T017/T019/T020 also touch
  files already modified by US2 (`useCatalogFilters.ts`, `FilterBar.tsx`,
  `CatalogPage.tsx`) — implement after US2 if sequential, to avoid merge
  conflicts.

**Note on parallelism**: `CatalogPage.tsx`, `FilterBar.tsx`, and
`useCatalogFilters.ts` are each touched by more than one story (T009/T014/
T020, T012/T019, T013/T017 respectively). A single developer going P1→P1→P1
in order (US1 → US2 → US3) avoids all conflicts. For a multi-developer team,
only `TemplateGrid.tsx` (US1) and `TagFilterChips.tsx` (US3) are truly
conflict-free to parallelize; the shared files need one owner or careful
rebasing.

### Within Each User Story

- Implementation tasks before their story's test task.
- Story's test task before its manual-verification task.
- Story complete before moving to the next priority (recommended given the
  file-overlap note above).

### Parallel Opportunities

- T002, T003, T006 (Foundational) can run in parallel — different files.
- T023, T024, T025 (Polish) can run in parallel.
- Across stories: only if accepting the file-overlap risk noted above.

---

## Parallel Example: Foundational Phase

```bash
# Launch independent Foundational tasks together:
Task: "Replace PageInfo with PageMeta in src/shared/types/api.ts"
Task: "Add tags field to TemplateListItem in src/features/home/types.ts"
Task: "Add MOCK_TAGS + per-template tags in src/features/home/api/templateClient.mock.ts"
# Then sequentially: T004 → T005, and T007 (after T004 and T006)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (required — pagination cannot work
   correctly without the contract fix).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run T011, confirm SC-001/SC-003 hold.
5. Ship pagination alone if desired.

### Incremental Delivery

1. Setup + Foundational → shared layer correct and verified.
2. User Story 1 (pagination) → verify → ship (MVP).
3. User Story 2 (sort) → verify → ship.
4. User Story 3 (Category/Tag) → verify → ship.
5. Polish → full regression + quickstart validation → close out.

---

## Notes

- The Foundational phase exists precisely because this feature's spec
  requirements (pagination, sort, Category/Tag) all sit on top of one
  shared, currently-broken data/contract layer — see research.md's
  contract-fix decision for why this isn't optional scope.
- Every fix task cites the specific `research.md`/`data-model.md` decision
  it implements, so the diff stays scoped to what was actually planned.
- Commit after each phase checkpoint.
