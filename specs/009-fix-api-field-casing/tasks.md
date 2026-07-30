---
description: 'Task list template for feature implementation'
---

# Tasks: Fix API field casing mismatch (snake_case vs camelCase)

**Input**: Design documents from `/specs/009-fix-api-field-casing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No new test tasks are added — this is a pure rename. Existing tests are
updated in place (in the same task as the file they assert on) so the suite keeps
passing and keeps validating real behavior, per FR-005.

**Organization**: Tasks are grouped by user story per spec.md. US1 (P1, the real
defect) requires renaming both types and both real clients plus their consumers. US2
(P2) is fully satisfied as a byproduct of US1 — it's a code-quality confirmation, not
separate work, so its phase is a verification-only checklist.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Single project. All paths are relative to the repo root
(`D:\WorkSpace\Github Clone Vô Đây\how2prompt-ui`).

---

## Phase 1: Setup

No setup required — no new dependencies, no new files, no scaffolding. This phase is
skipped.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Rename the two type files first — every client and component task in
Phase 3 depends on the renamed type names existing, since TypeScript will fail to
compile otherwise.

**⚠️ CRITICAL**: T001 and T002 MUST be done before any task in Phase 3.

- [x] T001 [P] Rename all snake_case fields to camelCase in
      `src/features/home/types.ts` per `data-model.md`'s TemplateListItem, AuthorBrief,
      Category, Tag, AiModel tables (`cover_image`→`coverImage`, `is_official`→
      `isOfficial`, `usage_count`→`usageCount`, `favorite_count`→`favoriteCount`,
      `is_favorited`→`isFavorited`, `created_at`→`createdAt`, `supported_models`→
      `supportedModels`, `full_name`→`fullName`, `avatar_url`→`avatarUrl`, `parent_id`→
      `parentId`, `sort_order`→`sortOrder`, `template_count`→`templateCount`,
      `usage_count`→`usageCount` on `Tag`, `model_type`→`modelType`, `icon_url`→
      `iconUrl`, `is_active`→`isActive`). Leave `CatalogFilters` and all non-listed
      fields unchanged.
- [x] T002 [P] Rename all snake_case fields to camelCase in
      `src/features/template-detail/types.ts` per `data-model.md`'s TemplateDetail and
      TemplateVersion tables (`cover_image`→`coverImage`, `is_official`→`isOfficial`,
      `full_name`→`fullName`, `avatar_url`→`avatarUrl`, `parent_id`→`parentId`,
      `sort_order`→`sortOrder`, `template_count`→`templateCount`, `supported_models`→
      `supportedModels`, `usage_count`→`usageCount`, `favorite_count`→`favoriteCount`,
      `is_favorited`→`isFavorited`, `view_count`→`viewCount`, `created_at`→`createdAt`,
      `current_version`→`currentVersion`, `prompt_body`→`promptBody`, `example_output`→
      `exampleOutput`). Per `data-model.md`'s "Explicitly NOT renamed" section, leave
      `TemplateVersion.version` as-is (not part of this fix).

**Checkpoint**: `tsc -b` will show every downstream file that still references an old
field name — expect it to fail loudly until Phase 3 tasks are done. That's expected.

---

## Phase 3: User Story 1 - Catalog and template detail data renders correctly against the real backend (Priority: P1) 🎯 MVP

**Goal**: Every real client, mock client, and component reads/writes the renamed
camelCase fields, so data-bound UI shows real values instead of `undefined` when the
API returns camelCase JSON, with zero behavior change against the current mock.

**Independent Test**: Per `quickstart.md` §2 — feed a camelCase-only fixture (shaped
exactly per `docs/api/openapi.yaml`) into `TemplateCard`/the catalog page and a
template detail page, and confirm every field renders instead of being blank.

### Implementation for User Story 1

- [x] T003 [P] [US1] Update `{ is_favorited: boolean }` → `{ isFavorited: boolean }`
      in the `toggleFavorite` return type in
      `src/features/home/api/templateClient.types.ts`.
- [x] T004 [P] [US1] Update `{ is_favorited: boolean }` → `{ isFavorited: boolean }`
      in the `toggleFavorite` return type in
      `src/features/template-detail/api/templateDetailClient.types.ts`.
- [x] T005 [P] [US1] Update `is_favorited` → `isFavorited` in the `toggleFavorite`
      response type usage in `src/features/home/api/templateClient.real.ts` (the
      `apiFetch<{ is_favorited: boolean }>` call).
- [x] T006 [P] [US1] Update `is_favorited` → `isFavorited` in the `toggleFavorite`
      response type usage in
      `src/features/template-detail/api/templateDetailClient.real.ts` (the
      `apiFetch<{ is_favorited: boolean }>` call).
- [x] T007 [US1] Rename every snake_case field in `MOCK_MODELS`, `MOCK_CATEGORIES`,
      `MOCK_TAGS`, `MOCK_TEMPLATES` fixture data and in the filtering/sorting/favoriting
      logic (`t.supported_models`, `t.created_at`, `t.usage_count`, `t.is_official`,
      `t.is_favorited`, and the `toggleFavorite` return value) in
      `src/features/home/api/templateClient.mock.ts`, keeping all fixture values and
      filter/sort/favorite behavior identical to today (depends on T001).
- [x] T008 [US1] Rename every snake_case field in `MOCK_TEMPLATE` fixture data and in
      `getDetail`/`toggleFavorite`/`incrementViewCount` (`is_favorited`, `view_count`,
      `cover_image`, `is_official`, `full_name`, `avatar_url`, `parent_id`, `sort_order`,
      `template_count`, `supported_models`, `usage_count`, `favorite_count`,
      `created_at`, `current_version`, `prompt_body`, `example_output`) in
      `src/features/template-detail/api/templateDetailClient.mock.ts`, keeping
      `current_version.version` unchanged per `data-model.md` and all other fixture
      values/behavior identical to today (depends on T002).
- [x] T009 [P] [US1] Update `TemplateCard` in
      `src/features/home/components/TemplateCard.tsx` to read `template.isFavorited`,
      `result.isFavorited` (from `toggleFavorite`), `template.isOfficial`,
      `template.supportedModels`, `template.usageCount` instead of the snake_case
      equivalents (depends on T001, T003, T005).
- [x] T010 [US1] Update `TemplateDetailPage` in
      `src/features/template-detail/components/TemplateDetailPage.tsx` to read
      `template.isOfficial`, `template.supportedModels`, `template.currentVersion.guide`,
      `template.currentVersion.exampleOutput`, `template.usageCount`,
      `template.isFavorited` instead of the snake_case equivalents (depends on T002).
- [x] T011 [US1] Update `TemplateMeta` in
      `src/features/template-detail/components/TemplateMeta.tsx` to read
      `result.isFavorited` (from `templateDetailClient.toggleFavorite`) instead of
      `result.is_favorited` (depends on T004, T006).
- [x] T012 [P] [US1] Update assertions in
      `src/features/home/api/templateClient.mock.test.ts` from `t.is_official` to
      `t.isOfficial` (depends on T007).
- [x] T013 [P] [US1] Update the mock `TemplateListItem`/`AiModel`/`Category`/`Tag`
      fixtures and assertions in `src/features/home/pages/CatalogPage.test.tsx` from
      snake_case to camelCase (`cover_image`, `is_official`, `full_name`, `avatar_url`,
      `supported_models`, `usage_count`, `favorite_count`, `is_favorited`, `created_at`,
      `model_type`, `icon_url`, `is_active`, `sort_order`, `parent_id`, `template_count`)
      per `data-model.md` (depends on T001). Do not touch the unrelated `tags`/`category`
      filter query-param keys or the `most_used` sort enum value — those are not field
      casing (see `data-model.md`'s "Explicitly NOT renamed" section).

**Checkpoint**: `npm run lint`, `npm run build` (`tsc -b && vite build`), and
`npm run test` all pass. User Story 1 is fully functional and independently
verifiable via `quickstart.md` §1 and §2.

---

## Phase 4: User Story 2 - Consistent field naming across the codebase for future API work (Priority: P2)

**Goal**: Confirm every field name in the affected type/client/component files is an
exact, case-sensitive match to `docs/api/openapi.yaml` — this is a verification pass
over the work already done in Phase 3, not new implementation.

**Independent Test**: Per `quickstart.md` §3 — grep the affected files for any
remaining old snake_case field name; only the two documented exceptions
(`TemplateVersion.version`, `TemplateListItem.tags` placement) may remain.

### Implementation for User Story 2

- [x] T014 [US2] Run `quickstart.md` §3's field-by-field sanity check across
      `src/features/home/{types.ts,api/templateClient.real.ts,api/templateClient.mock.ts,components/TemplateCard.tsx,pages/CatalogPage.tsx}`
      and
      `src/features/template-detail/{types.ts,api/templateDetailClient.real.ts,api/templateDetailClient.mock.ts,components/TemplateDetailPage.tsx,components/TemplateHero.tsx,components/TemplateMeta.tsx,components/ModelTags.tsx}`
      (depends on T003-T013); confirm `CategoryFilterChips.tsx`, `TagFilterChips.tsx`,
      `TemplateHero.tsx`, `ModelTags.tsx`, and `CatalogPage.tsx` need no edits since they
      only read fields that were never snake_case (`c.id`, `c.slug`, `c.name`, `t.name`,
      or already-camelCase props passed down from `TemplateDetailPage`). Fix any stray
      occurrence found.

**Checkpoint**: Zero unexplained snake_case field names remain in the `home` and
`template-detail` features.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification before reporting the change complete, per this
project's "Before calling something done" rule and Constitution Principle V.

- [x] T015 Run `npm run lint`, `npm run build`, and `npm run test` and confirm all
      pass with zero snake_case-related failures.
- [ ] T016 Run `npm run dev` and manually walk through the catalog page and a
      template detail page per `quickstart.md` §1, confirming identical visual output
      and behavior (cards, badges, counts, dates, favoriting) to before this change.
      NOT DONE by the implementing agent — no browser-driving tool was available in that
      environment; `npm run dev` was confirmed to boot cleanly, and the Vitest/RTL suite
      (T015) already renders `TemplateCard` and `CatalogPage` against real DOM assertions
      with the renamed fields, but an actual visual walkthrough still needs a human or a
      browser-automation tool before this is fully "done" per Constitution Principle V.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS Phase 3.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T001, T002) completing.
- **User Story 2 (Phase 4)**: Depends on Phase 3 (T003-T013) completing — it verifies
  that work, so it cannot start before it.
- **Polish (Phase 5)**: Depends on Phase 4 completing.

### Within Phase 3 (User Story 1)

- T003, T004, T005, T006 are independent of each other (different files) — parallel.
- T007 depends on T001 (types must exist first).
- T008 depends on T002.
- T009 depends on T001, T003, T005 (needs the renamed type and client return type).
- T010 depends on T002.
- T011 depends on T004, T006.
- T012 depends on T007 (mock data must be renamed before test assertions match it).
- T013 depends on T001.

### Parallel Opportunities

- T001 and T002 run in parallel (Phase 2, different files).
- T003, T004, T005, T006 run in parallel (Phase 3, different files, no shared
  dependency beyond the already-complete Phase 2).
- T009 and T013 can run in parallel with T007/T008/T010/T011/T012 once their
  respective dependencies clear, since they touch different files.

---

## Parallel Example: Phase 2 (Foundational)

```bash
Task: "Rename snake_case fields to camelCase in src/features/home/types.ts"
Task: "Rename snake_case fields to camelCase in src/features/template-detail/types.ts"
```

## Parallel Example: Phase 3 (User Story 1) — client-type layer

```bash
Task: "Update toggleFavorite return type in src/features/home/api/templateClient.types.ts"
Task: "Update toggleFavorite return type in src/features/template-detail/api/templateDetailClient.types.ts"
Task: "Update toggleFavorite response type in src/features/home/api/templateClient.real.ts"
Task: "Update toggleFavorite response type in src/features/template-detail/api/templateDetailClient.real.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001, T002).
2. Complete Phase 3: User Story 1 (T003-T013).
3. **STOP and VALIDATE**: Run `quickstart.md` §1 and §2 — this is the entire fix; the
   real-world defect (blank fields against a real backend) is resolved here.

### Incremental Delivery

1. Phase 2 → types renamed, nothing compiles yet (expected).
2. Phase 3 → everything compiles again, defect fixed, zero behavior change — this is
   shippable on its own.
3. Phase 4 → confirms no field was missed; no functional change, pure verification.
4. Phase 5 → final gate before reporting done.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- This is a rename-only refactor: no new abstractions, no new dependencies, no
  behavior change (FR-006) — every task should be a mechanical find-and-replace
  scoped to the field names in `data-model.md`.
- `TemplateVersion.version`→`versionNumber` and `TemplateListItem.tags` placement are
  explicitly out of scope (see `research.md`) — do not fix them as part of these
  tasks; they're tracked as a follow-up.
- Commit after each task or logical group, per user preference (only commit when
  explicitly asked).
