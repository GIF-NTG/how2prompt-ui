---
description: 'Task list template for feature implementation'
---

# Tasks: Prompt History & Favorites

**Input**: Design documents from `/specs/010-us4-prompt-history-favorites/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/history-favorites.md, quickstart.md

**Tests**: Not explicitly requested in the feature spec, but included per
this repo's established convention (a test file per new hook/util/page —
see `templateClient.mock.test.ts`, `CatalogPage.test.tsx`,
`DynamicForm.test.tsx`) and per Constitution Principle V.

**Organization**: Tasks are grouped by user story in spec.md's priority
order — US1 and US2 are P1, US3 and US4 are P2, US5 is P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an
  incomplete task)
- **[Story]**: US1–US5 per spec.md
- Paths are repo-relative from `D:\WorkSpace\Github Clone Vô Đây\how2prompt-ui`

## Path Conventions

Single Vite/React SPA. New feature directory: `src/features/history/` (see
plan.md's Project Structure). Existing files touched: `src/app/App.tsx`
(routes), `src/features/template-generate/hooks/useGenerateForm.ts` +
`components/TemplateGenerateSection.tsx` (reload override), 4 files in
`home`/`template-detail` for the `toggleFavorite` fix, and their 2 call
sites (`TemplateCard.tsx`, `TemplateMeta.tsx`).

---

## Phase 1: Setup

- [x] T001 Run `npm run lint`, `npm run build`, and `npm run test -- --run`
      at the repo root and confirm all three currently pass, establishing
      the pre-feature baseline

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared `historyClient` (types + mock + real + switch) every
user story reads from. Per research.md's feature-module decision, this
mirrors `templateClient.ts`'s existing mock/real split exactly.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Create `src/features/history/types.ts` with `HistoryListItem`,
      `HistoryDetail`, `HistoryFilters` (data-model.md)
- [x] T003 [P] Create `src/features/history/api/historyClient.types.ts`
      with a `HistoryClient` interface: `list(filters: Partial<HistoryFilters>,
    page: number, size: number)`, `get(id: string)`, `remove(id: string)`,
      `listFavorites(page: number, size: number)` (data-model.md,
      contracts/history-favorites.md)
- [x] T004 Create `src/features/history/api/historyClient.mock.ts` — an
      in-memory fixture array of 20+ `HistoryDetail` records (enough to
      exercise pagination), including at least one entry with `templateId:
    null` (deleted template, FR-009) and one whose `templateVersionId` is
      older than its template's current version (FR-010); `list` applies
      template/model/date-range filtering + `page`/`size` slicing over the
      array client-side; `remove` splices the entry out (soft-delete
      simulated as removal from the mock store); `listFavorites` returns
      `TemplateListItem`-shaped entries reusing the favorited fixtures in
      `src/features/home/api/templateClient.mock.ts` — that file currently
      has zero `isFavorited: true` fixtures, so flip enough of them to
      `true` (21+, to exceed one default page) to make `listFavorites`
      pagination actually exercisable (feeds T033/T036) (depends on T002,
      T003)
      **Deviation**: `templateClient.mock.ts` only has 5 total template
      fixtures — physically cannot hold 21+ favorited entries. Kept
      `listFavorites` genuinely paginating (`page`/`size` over
      `MOCK_TEMPLATES.filter(favorites.has)`), and moved pagination-behavior
      coverage to T036's test using a small `size` override instead of a
      21-item dataset. `MOCK_TEMPLATES`/`favorites` exported from
      `templateClient.mock.ts` for reuse here.
- [x] T005 Create `src/features/history/api/historyClient.real.ts` — `GET
    /generated-prompts` (with `templateId`/`model`/`from`/`to`/`page`/`size`
      query params), `GET /generated-prompts/{id}`, `DELETE
    /generated-prompts/{id}`, `GET /favorites` via `apiFetch`
      (contracts/history-favorites.md) (depends on T003)
- [x] T006 Create `src/features/history/api/historyClient.ts` (mock/real
      switch, mirroring `templateClient.ts`'s existing
      `VITE_API_BASE_URL`-based pattern) (depends on T004, T005)
      **Deviation**: exported as `createHistoryClient(accessToken?)`, a
      factory mirroring `createGenerateClient`'s pattern, not a plain
      singleton — every history/favorites endpoint requires an
      authenticated User (contracts/history-favorites.md), unlike
      `templateClient.ts`'s mostly-public browse endpoints, so the
      current session's token must be threaded in per the existing
      `TemplateGenerateSection.tsx` precedent.

**Checkpoint**: `historyClient` compiles and is importable. Each user story
below can now proceed independently.

---

## Phase 3: User Story 1 - View my prompt history (Priority: P1) 🎯 MVP

**Goal**: A `/history` page listing the logged-in User's past generations,
filterable and paginated.

**Independent Test**: Generate a prompt, open `/history`, confirm it's
listed with template/model/snippet/date; apply filters and load the next
page (quickstart.md §1).

### Implementation for User Story 1

- [x] T007 [P] [US1] Create `src/features/history/hooks/useHistoryFilters.ts`
      — `useSearchParams`-backed `templateId`/`model`/`from`/`to` getters and
      setters, mirroring `useCatalogFilters.ts`'s shape exactly
      (research.md's URL-filter decision)
- [x] T008 [P] [US1] Create `src/features/history/components/HistoryEmptyState.tsx`
      — distinct copy for "no history at all" vs. "no results for current
      filters" (spec.md Edge Cases), with a link back to `/`
- [x] T009 [US1] Create `src/features/history/components/HistoryFilterBar.tsx`
      — template/model dropdowns + date-range inputs, controlled by
      `useHistoryFilters` (depends on T007)
- [x] T010 [US1] Create `src/features/history/components/HistoryList.tsx` —
      renders `HistoryListItem[]` (template title, AI model, prompt
      snippet, date) with a "load more" control driven by `PageMeta.hasNext`,
      matching `TemplateGrid.tsx`'s load-more pattern (depends on T002)
- [x] T011 [US1] Create `src/features/history/pages/HistoryPage.tsx` —
      self-guards on `{ session, isRestoring }` from `useAuth()` (same
      pattern as `ProfileSettingsPage.tsx`: wait for `isRestoring`, then
      `<Navigate to="/login" replace />` if no session), fetches via
      `historyClient.list()` using the `requestGeneration` ref pattern from
      `CatalogPage.tsx`, composes `HistoryFilterBar` + `HistoryList` +
      `HistoryEmptyState` (depends on T006, T007, T008, T009, T010)
- [x] T012 [US1] Register the `/history` route under `RootLayout` in
      `src/app/App.tsx` (the TopBar's `/history` link already exists and is
      currently dead — see `src/shared/components/TopBar.tsx`) (depends on
      T011)
- [x] T013 [P] [US1] Create `src/features/history/api/historyClient.mock.test.ts`
      — verifies filtering (by template, model, date range) and pagination
      slicing over the fixture array
- [x] T014 [P] [US1] Create `src/features/history/pages/HistoryPage.test.tsx`
      — renders the list, the empty state, and confirms a Guest session
      redirects to `/login` (depends on T011)

**Checkpoint**: User Story 1 is fully functional and independently
testable.

---

## Phase 4: User Story 2 - Every generation is automatically saved (Priority: P1)

**Goal**: Confirm/exercise that a successful generate produces a history
entry with zero extra User action, and that Guests/failed attempts never
do (this is backend-owned per spec.md's Assumptions — the frontend work
here is limited to making the _mock_ environment demonstrate the same
behavior end-to-end, since there is no live backend in this repo).

**Independent Test**: Generate a prompt as a logged-in User (mock client),
refresh `/history` — the new entry is already there, with no extra save
step (quickstart.md §2).

### Implementation for User Story 2

- [x] T015 [US2] Add an internal append helper (e.g.
      `recordGeneratedPrompt(entry: HistoryDetail)`) exported from
      `src/features/history/api/historyClient.mock.ts`'s in-memory store
      (depends on T004)
- [x] T016 [US2] Wire `src/features/template-generate/api/generateClient.mock.ts`'s
      `generate()` to build a `HistoryDetail` from the request/response and
      call T015's helper **only when `accessToken` is present** (mirrors the
      existing `generatedPromptId: accessToken ? ... : null` guard already
      in that file, so Guest generations continue to add nothing) (depends
      on T015)
- [x] T017 [P] [US2] Create `src/features/template-generate/api/generateClient.mock.test.ts`
      asserting: a logged-in `generate()` call results in a new entry
      retrievable via `historyClient.list()`, and a Guest (no
      `accessToken`) call adds nothing (depends on T016)

**Checkpoint**: User Stories 1 and 2 both work together — generating in the
mock app immediately surfaces the entry on `/history`.

---

## Phase 5: User Story 3 - Reload a prompt from history (Priority: P2)

**Goal**: "Re-run" on a history entry opens that template's generate form
pre-filled with the entry's original inputs; generating again creates a new
entry, never overwrites the old one; deleted-template and
newer-version-available cases are handled distinctly.

**Independent Test**: Click "Re-run" on a history entry, confirm the form
is pre-filled; edit and generate, confirm a new entry appears and the old
one is unchanged; repeat against a fixture with a deleted template and one
with a newer version (quickstart.md §3).

### Implementation for User Story 3

- [x] T018 [P] [US3] Extend `useGenerateForm` in
      `src/features/template-generate/hooks/useGenerateForm.ts` to accept an
      optional second argument `initialOverride?: { modelCode: string;
    inputValues: Record<string, string | number | boolean | string[]>;
    extraInstructions?: string | null }`; when present, seed
      `selectedModelCode`/`inputValues`/`extraInstructions` from it instead
      of the template's defaults (research.md's pre-fill decision)
- [x] T019 [US3] Add an optional `reloadOverride` prop to
      `src/features/template-generate/components/TemplateGenerateSection.tsx`
      and forward it into `useGenerateForm(template, reloadOverride)`
      (depends on T018)
- [x] T020 [P] [US3] Create `src/features/template-detail/components/ReloadUnavailableBanner.tsx`
      — shown when the reload target's `templateId` is `null`; displays the
      saved `finalPrompt` read-only with a copy action and blocks the
      generate form from mounting (FR-009)
- [x] T021 [P] [US3] Create `src/features/template-detail/components/NewerVersionBadge.tsx`
      — shown when the reload target's `templateVersionId` differs from the
      template's current version id (FR-010)
- [x] T022 [US3] Wire `src/features/template-detail/components/TemplateDetailPage.tsx`
      to read a `?reload=<id>` query param via `useSearchParams`; when
      present, call `historyClient.get(id)` and branch: template gone →
      render `ReloadUnavailableBanner` instead of `TemplateGenerateSection`;
      version mismatch → render `NewerVersionBadge` above
      `TemplateGenerateSection`; otherwise → pass the fetched values as
      `reloadOverride` into `TemplateGenerateSection` (depends on T006,
      T019, T020, T021)
- [x] T023 [US3] Add a "Re-run" action to
      `src/features/history/components/HistoryList.tsx` that navigates to
      `/templates/${item.templateId}?reload=${item.id}` via `useNavigate`,
      disabled when `templateId` is `null` (depends on T010)
      **Deviation**: instead of a disabled button (dead-end for FR-009's
      "still allowed to view/copy" requirement), `templateId: null` entries
      show a "Xem prompt" (view prompt) button that lazily fetches
      `historyClient.get(id)` and expands `ReloadUnavailableBanner` inline
      — since there is no valid template route to navigate to for those
      entries in the first place, an inline view is the only way to satisfy
      FR-009 for them.
- [x] T024 [P] [US3] Create `src/features/template-generate/hooks/useGenerateForm.test.ts`
      covering: no override → template defaults used (existing behavior
      unchanged); override present → seeded from override (depends on T018)
- [x] T025 [P] [US3] Create `src/features/template-detail/components/TemplateDetailPage.test.tsx`
      covering the three reload branches (normal pre-fill, unavailable
      banner, newer-version badge) (depends on T022)
- [x] T025a [US3] Extend `src/features/template-generate/api/generateClient.mock.test.ts`
      (from T017) with a case that reloads an existing mock history entry
      (override seeded per T018), changes one input value, and generates
      again — assert `historyClient.list()` afterward contains **both** the
      original entry (untouched — same `id`, `inputValues`) and a new,
      distinct entry (spec.md US3 Acceptance Scenario 2 / FR-008) (depends
      on T017, T022)

**Checkpoint**: User Story 3 works independently of US4/US5.

---

## Phase 6: User Story 4 - Favorite or unfavorite a template (Priority: P2)

**Goal**: The heart-icon toggle actually toggles both directions (fixing
the existing POST-only bug — research.md), and a `/favorites` page lists
everything the User has favorited.

**Independent Test**: Favorite a template, unfavorite it, confirm the count
moves both ways and the state survives a reload; visit `/favorites` and
unfavorite from there (quickstart.md §4).

### Implementation for User Story 4

- [x] T026 [P] [US4] Update `toggleFavorite`'s signature to
      `toggleFavorite(templateId: string, isFavorited: boolean):
    Promise<{ isFavorited: boolean }>` in
      `src/features/home/api/templateClient.types.ts` and
      `src/features/template-detail/api/templateDetailClient.types.ts`
      (research.md's toggle fix)
- [x] T027 [US4] Fix `src/features/home/api/templateClient.real.ts`'s
      `toggleFavorite` to call `POST /templates/{id}/favorite` when
      `isFavorited` is `false` and `DELETE /templates/{id}/favorite` when
      `true`, returning the flipped state (depends on T026)
- [x] T028 [US4] Apply the same fix to
      `src/features/template-detail/api/templateDetailClient.real.ts`'s
      `toggleFavorite` (depends on T026)
- [x] T029 [P] [US4] Update `src/features/home/api/templateClient.mock.ts`
      and `src/features/template-detail/api/templateDetailClient.mock.ts`'s
      `toggleFavorite` to match the new signature (flip and return based on
      the passed `isFavorited`) (depends on T026)
- [x] T030 [US4] Update the call site in
      `src/features/home/components/TemplateCard.tsx` to pass its current
      `isFavorited` state into `toggleFavorite`, **and** make the toggle
      optimistic: flip `isFavorited` (and the displayed count) immediately
      on click, before the request resolves, then revert both if the
      request throws (SC-004's <500ms-perceived requirement — the current
      `await` "-then-`setState`" flow is not optimistic) (depends on T027,
      T029)
- [x] T031 [US4] Update the call site in
      `src/features/template-detail/components/TemplateMeta.tsx` to pass
      its current `favorited` state into `toggleFavorite`, with the same
      optimistic-update-then-revert-on-error behavior as T030 (depends on
      T028, T029)
- [x] T032 [US4] Create `src/features/history/components/FavoriteTemplateGrid.tsx`
      — reuses `TemplateCard` (`src/features/home/components/TemplateCard.tsx`)
      and removes an item from its local list immediately when unfavorited
      from this view (FR-013) (depends on T030)
- [x] T033 [US4] Create `src/features/history/pages/FavoritesPage.tsx` —
      same self-guard pattern as `HistoryPage.tsx`, fetches via
      `historyClient.listFavorites()`, renders `FavoriteTemplateGrid` or an
      empty state, **and** paginates with a "load more" control driven by
      `PageMeta.hasNext` the same way `HistoryList.tsx`/`HistoryPage.tsx`
      does (FR-013 says "a list of **all** templates favorited" — the
      endpoint is paged, so a User with more favorites than one page must
      still be able to reach the rest) (depends on T006, T032)
- [x] T034 [US4] Register the `/favorites` route under `RootLayout` in
      `src/app/App.tsx` (depends on T033)
- [x] T035 [P] [US4] Extend `src/features/home/api/templateClient.mock.test.ts`
      with a case asserting `toggleFavorite` flips both directions
      (depends on T029)
- [x] T036 [P] [US4] Create `src/features/history/pages/FavoritesPage.test.tsx`
      covering the list render, empty state, unfavorite-removes-item
      behavior, and loading a second page via "load more" (depends on T033)

**Checkpoint**: User Story 4 works independently; the heart icon's
existing double-POST bug is fixed everywhere it's used.

---

## Phase 7: User Story 5 - Delete a history entry (Priority: P3)

**Goal**: Single and bulk soft-delete of history entries from `/history`,
with a confirmation step and immediate (optimistic) removal from the list.

**Independent Test**: Delete one entry (confirm dialog), then select
several and bulk-delete; confirm both leave and stay gone after a refresh
(quickstart.md §5).

### Implementation for User Story 5

- [x] T037 [P] [US5] Create `src/features/history/components/DeleteConfirmDialog.tsx`
      — generic confirm dialog usable for both a single item and an
      N-item bulk selection (distinct copy for each case)
- [x] T038 [US5] Add checkbox multi-select state, a per-item delete button,
      and a "Delete selected" bar to
      `src/features/history/components/HistoryList.tsx`, opening
      `DeleteConfirmDialog` before either action (depends on T010, T037)
- [x] T039 [US5] Wire delete/bulk-delete confirm handlers into
      `src/features/history/pages/HistoryPage.tsx`: call
      `historyClient.remove(id)` (looped via `Promise.all` for bulk) and
      remove the entries from local state immediately on success (depends
      on T011, T038)
- [x] T040 [P] [US5] Extend `src/features/history/api/historyClient.mock.test.ts`
      with `remove()` cases (single id; verify it no longer appears in a
      subsequent `list()` call) (depends on T013)

**Checkpoint**: All five user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T041 [P] Run `npm run lint` at the repo root and fix any issues
      introduced above
- [x] T042 [P] Run `npm run build` at the repo root and fix any type/build
      errors introduced above
- [x] T043 [P] Run `npm run test -- --run` at the repo root and confirm
      100% pass, including every new test file from T013/T014/T017/T024/
      T025/T025a/T035/T036/T040
- [x] T044 Run the full `quickstart.md` validation end-to-end (all of
      spec.md's Acceptance Scenarios, SC-001–SC-005) in a running browser
      against the mock client. Manually verified by the user in a running
      browser — confirmed OK.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run first.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks every user story.**
- **User Stories (Phase 3-7)**: All depend on Foundational only. US1, US2,
  US4 touch disjoint new files and can proceed fully in parallel. US3
  depends on US1's `HistoryList.tsx` existing only for its final wiring
  task (T023) — its core implementation (T018-T022, T024-T025) does not.
  T025a additionally depends on US2's T017 (extends the same test file).
  US5 depends on US1's `HistoryList.tsx`/`HistoryPage.tsx` existing (T038,
  T039) since it extends those same files.
- **Polish (Phase 8)**: Depends on all five user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational.
- **US2 (P1)**: Depends only on Foundational — independently testable via
  T017's unit test even before US1's UI exists.
- **US3 (P2)**: Depends on Foundational for T018-T022, T024-T025; T023
  additionally needs US1's `HistoryList.tsx` (T010) to exist.
- **US4 (P2)**: Depends only on Foundational.
- **US5 (P3)**: Depends on US1's `HistoryList.tsx` (T010) and
  `HistoryPage.tsx` (T011).

### Within Each User Story

- Client/type work before components; components before the page that
  composes them; page before its route registration.
- Story complete (checkpoint) before its dependents (US3→T023, US5) start
  their file-sharing tasks.

### Parallel Opportunities

- T002, T003 (Foundational) in parallel.
- All of US1 (T007-T014), US2 (T015-T017), and US4 (T026-T036) can be
  worked in parallel by different people once Foundational is merged.
- T020, T021 (US3) in parallel; T024, T025 (US3) in parallel.
- T026, T029 (US4) in parallel; T035, T036 (US4) in parallel.
- T041, T042, T043 (Polish) in parallel.

---

## Parallel Example: Post-Foundational split

```bash
# Track A: History list + delete
Task: "useHistoryFilters.ts, HistoryEmptyState.tsx, HistoryFilterBar.tsx, HistoryList.tsx, HistoryPage.tsx"
# ...through T014, then T037-T040 (US5)

# Track B: Auto-save verification + reload
Task: "generateClient.mock.ts wiring (US2)"
Task: "useGenerateForm override, reload banners, TemplateDetailPage wiring (US3)"

# Track C: Favorites fix + page
Task: "toggleFavorite POST/DELETE fix across templateClient/templateDetailClient"
Task: "FavoriteTemplateGrid.tsx, FavoritesPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (required — nothing else can start
   without it).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run T014, confirm the history list alone is
   correct against the mock client.
5. A read-only, filterable history view is demonstrable even before
   reload/favorites/delete exist.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → Test independently → Demo (MVP).
3. US2 → Test independently → Demo (auto-save proven end-to-end).
4. US4 → Test independently → Demo (favorites, including the toggle-both-
   directions bug fix).
5. US3 → Test independently → Demo (reload/re-run, deleted-template and
   newer-version edge cases).
6. US5 → Test independently → Demo (single + bulk delete).
7. Each story adds value without breaking the previous ones.

---

## Notes

- `[P]` tasks touch different files and have no dependency on an
  incomplete task in the same phase.
- Every task cites the specific `research.md`/`data-model.md`/
  `contracts/history-favorites.md` decision it implements.
- Commit after each checkpoint.
