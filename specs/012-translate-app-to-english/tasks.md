---
description: 'Task list for feature implementation'
---

# Tasks: Translate App Text to English

**Input**: Design documents from `/specs/012-translate-app-to-english/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No new tests are added by this feature — existing `*.test.tsx`/`*.test.ts`
files that assert on Vietnamese text are updated in place so they keep passing
against the new English text (spec FR-003). No test-first tasks are generated.

**Organization**: Tasks are grouped by user story (per `spec.md`) so each story can be
translated and verified independently. Each task edits exactly one file's Vietnamese
string literals to English, preserving meaning, without changing behavior/layout/logic
(spec FR-001–FR-006).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to the repository root (`how2prompt-ui/`)

## Path Conventions

Single frontend project — all paths are under `src/` (see `plan.md` Project Structure).

---

## Phase 1: Setup

**Purpose**: Establish the baseline scope before editing any file

- [X] T001 Run `grep -rlP '[À-ỹ]' src/` from the repo root and save the output as the
      authoritative list of files still containing Vietnamese text; use it to confirm
      no file is missed across Phases 2–5 below

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Translate shared/cross-cutting UI (nav bar, theme toggle, fallback,
http error surface) that appears on every screen, so every user story phase below
starts from an all-English shell

**⚠️ CRITICAL**: Complete this phase before starting any user story phase — every
screen in every story renders `TopBar`/`ThemeToggle`/`PageFallback`, and every
screen that shows a template/category name or description (US1's catalog/detail,
US3's admin dashboard) depends on T005a's `getI18nValue` fix

- [X] T002 [P] Translate remaining Vietnamese text in `src/shared/components/TopBar.tsx`
- [X] T003 [P] Translate remaining Vietnamese text in `src/shared/components/ThemeToggle.tsx`
- [X] T004 [P] Translate remaining Vietnamese text in `src/shared/utils/httpClient.ts` (translate only the user-facing fallback error message on the line that constructs `ApiError`; the Vietnamese word inside the JSDoc comment above it is out of scope per spec FR-006)
- [X] T005 [P] Translate remaining Vietnamese text in `src/app/PageFallback.tsx`
- [X] T005a Fix `getI18nValue` in `src/shared/utils/i18n.ts` to prefer `en` over `vi`
      regardless of the `locale` argument (see `research.md`), so every
      `I18nString`-typed field (template/category names, descriptions, dashboard
      popular-template titles) renders in English without editing each data file's
      `vi` values individually
- [X] T006 Update assertions in `src/app/App.test.tsx` to match the translated shell text (depends on T002–T005; deferred until LoginPage's 'Chào bạn quay lại' heading is translated in T044, since that's the text this test actually asserts on) — done alongside T044, assertion now checks for 'Welcome back'

**Checkpoint**: Shared shell is fully English — user story phases can now begin

---

## Phase 3: User Story 1 - Browse and generate prompts in English (Priority: P1) 🎯 MVP

**Goal**: Every screen in the core discovery + generation flow (home/catalog,
template detail, generate form) displays English-only text in every state.

**Independent Test**: Load the home/catalog page, open a template detail page, and
run through the generate form; confirm every visible string is in English (spec
Acceptance Scenarios 1–3 for US1).

### Implementation for User Story 1 — home/catalog

- [X] T007 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/FeaturedTemplateHero.tsx`
- [X] T008 [P] [US1] Translate remaining Vietnamese text in `src/features/home/pages/CatalogPage.tsx`
- [X] T009 [P] [US1] Update assertions in `src/features/home/pages/CatalogPage.test.tsx` to match the translated catalog page text
- [X] T010 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/ModelFilter.tsx`
- [X] T011 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/FilterPopover.tsx` (relies on T005a for `getI18nValue(c.name)` to render English)
- [X] T012 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/TemplateCard.tsx` (relies on T005a for `getI18nValue(template.title/description)` to render English)
- [X] T013 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/FilterBar.tsx`
- [X] T014 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/TemplateGrid.tsx`
- [X] T015 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/ChipFilterGroup.tsx`
- [X] T016 [P] [US1] Translate remaining Vietnamese text in `src/features/home/api/templateClient.mock.ts` — leave existing `I18nString.vi` field values as-is per T005a's decision; only translate plain string fields
- [X] T017 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/SearchBox.tsx`
- [X] T018 [P] [US1] Translate remaining Vietnamese text in `src/features/home/components/EmptyState.tsx`

### Implementation for User Story 1 — template detail

- [X] T019 [P] [US1] Update assertions in `src/features/template-detail/components/TemplateDetailPage.test.tsx` to match translated detail-page text
- [X] T020 [P] [US1] Translate remaining Vietnamese text in `src/features/template-detail/hooks/useTemplateDetail.ts`
- [X] T021 [P] [US1] Translate remaining Vietnamese text in `src/features/template-detail/components/TemplateMeta.tsx`
- [X] T022 [P] [US1] Translate remaining Vietnamese text in `src/features/template-detail/api/templateDetailClient.mock.ts` — leave existing `I18nString.vi` field values as-is per T005a's decision; only translate plain string fields
- [X] T023 [P] [US1] Translate remaining Vietnamese text in `src/features/template-detail/components/TemplateHero.tsx` (relies on T005a for `getI18nValue(title/description/cat.name)` to render English)
- [X] T024 [P] [US1] Translate remaining Vietnamese text in `src/features/template-detail/components/ReloadUnavailableBanner.tsx`
- [X] T025 [P] [US1] Translate remaining Vietnamese text in `src/features/template-detail/components/NotFoundState.tsx`
- [X] T026 [P] [US1] Translate remaining Vietnamese text in `src/features/template-detail/components/NewerVersionBadge.tsx`
- [X] T027 [P] [US1] Translate remaining Vietnamese text in `src/features/template-detail/components/BackLink.tsx`

### Implementation for User Story 1 — generate form

- [X] T028 [P] [US1] Translate remaining Vietnamese text in `src/features/template-generate/components/GenerateActions.tsx`
- [X] T029 [P] [US1] Update assertions in `src/features/template-generate/components/DynamicForm.test.tsx` to match translated form text
- [X] T030 [P] [US1] Translate remaining Vietnamese text in `src/features/template-generate/components/TemplateGenerateSection.tsx`
- [X] T031 [P] [US1] Translate remaining Vietnamese text in `src/features/template-generate/components/FormField.tsx` (also fixed its `locale = 'vi'` default parameter to `'en'` — same class of bug as T005a's `getI18nValue`, found while translating this file)
- [X] T032 [P] [US1] Update assertions in `src/features/template-generate/hooks/useGenerateForm.test.ts` to match translated form text
- [X] T033 [P] [US1] Translate remaining Vietnamese text in `src/features/template-generate/components/PreviewPanel.tsx`
- [X] T034 [P] [US1] Translate remaining Vietnamese text in `src/features/template-generate/components/ModelVariantSelect.tsx`
- [X] T035 [P] [US1] Update assertions in `src/features/template-generate/components/ModelVariantSelect.test.tsx` to match translated selector text
- [X] T036 [P] [US1] Update assertions in `src/features/template-generate/components/GenerateActions.test.tsx` to match translated action text
- [X] T037 [P] [US1] Translate remaining Vietnamese text in `src/features/template-generate/components/ExtraInstructionsField.tsx`
- [X] T038 [P] [US1] Translate remaining Vietnamese text in `src/features/template-generate/api/generateClient.mock.ts` — leave existing `I18nString.vi` field values as-is per T005a's decision; only translate plain string fields

- [X] T039 [US1] Run `npm run test`, `npm run lint`, `npm run build`, then manually walk through the home/catalog page, a template detail page, and the generate form (per `quickstart.md` §4 P1) to confirm English-only text in every state (depends on T007–T038) — automated scan/test/lint/build all clean (fixed a genuine test collision in CatalogPage.test.tsx where a mock template titled "Newest" collided with the translated sort-option label; App.test.tsx's single full-suite timeout was pre-existing load flakiness, confirmed passing in isolation); manual browser walkthrough still pending (see Polish phase T103)

**Checkpoint**: User Story 1 (home/catalog, template detail, generate form) is fully
English and independently verified — this is the MVP slice

---

## Phase 4: User Story 2 - Manage account in English (Priority: P2)

**Goal**: Every auth screen (login, register, forgot/reset password, verify email,
profile settings) displays English-only text in every state, including validation
and error/success messages.

**Independent Test**: Walk through login, register, forgot/reset password, email
verification, and profile settings; confirm no Vietnamese text appears in any state
(spec Acceptance Scenarios 1–3 for US2).

### Implementation for User Story 2

- [X] T040 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/pages/ProfileSettingsPage.tsx` (language-picker option labels "Tiếng Việt"/"English" intentionally left as endonyms, not app-chrome text)
- [X] T041 [P] [US2] Update assertions in `src/features/auth/pages/LoginPage.test.tsx` to match translated login text
- [X] T042 [P] [US2] Update assertions in `src/features/auth/pages/RegisterPage.test.tsx` to match translated register text
- [X] T043 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/pages/RegisterPage.tsx`
- [X] T044 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/pages/LoginPage.tsx`
- [X] T045 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/api/authClient.real.ts`
- [X] T046 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/pages/VerifyEmailPage.tsx`
- [X] T047 [P] [US2] Update assertions in `src/features/auth/pages/VerifyEmailPage.test.tsx` to match translated verify-email text
- [X] T048 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/pages/ResetPasswordPage.tsx`
- [X] T049 [P] [US2] Update assertions in `src/features/auth/pages/ResetPasswordPage.test.tsx` to match translated reset-password text
- [X] T050 [P] [US2] Update assertions in `src/features/auth/pages/ProfileSettingsPage.test.tsx` to match translated profile-settings text
- [X] T051 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/pages/ForgotPasswordPage.tsx`
- [X] T052 [P] [US2] Update assertions in `src/features/auth/pages/ForgotPasswordPage.test.tsx` to match translated forgot-password text
- [X] T053 [P] [US2] Update assertions in `src/features/auth/context/AuthContext.test.tsx` to match translated auth-context text
- [X] T054 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/components/GuestContinueLink.tsx`
- [X] T055 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/components/GoogleSignInButton.tsx`
- [X] T056 [P] [US2] Update assertions in `src/features/auth/components/GoogleSignInButton.test.tsx` to match translated button text
- [X] T057 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/components/EmailVerificationBanner.tsx`
- [X] T058 [P] [US2] Update assertions in `src/features/auth/components/EmailVerificationBanner.test.tsx` to match translated banner text
- [X] T059 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/components/AuthLayout.tsx`
- [X] T060 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/api/googleIdentity.ts`
- [X] T061 [P] [US2] Translate remaining Vietnamese text in `src/features/auth/api/authClient.mock.ts`

- [X] T062 [US2] Run `npm run test`, `npm run lint`, `npm run build`, then manually walk through login, register, forgot/reset password, email verification, and profile settings (per `quickstart.md` §4 P2), triggering at least one validation error and one success state on each, to confirm English-only text (depends on T040–T061) — automated scan/test/lint/build all clean; the only remaining Vietnamese in `src/features/auth` is the intentional "Tiếng Việt" language-name option; manual browser walkthrough still pending (see Polish phase T103)

**Checkpoint**: User Stories 1 AND 2 both fully English and independently verified

---

## Phase 5: User Story 3 - Manage history, favorites, and admin content in English (Priority: P3)

**Goal**: History, favorites, and every admin screen (AI models, taxonomy, templates,
dashboard) display English-only text, including dialogs and chart labels.

**Independent Test**: Open the history and favorites pages, and each admin page;
confirm no Vietnamese text remains, including dialog/confirmation text and chart
labels (spec Acceptance Scenarios 1–2 for US3).

### Implementation for User Story 3 — history & favorites

- [X] T063 [P] [US3] Translate remaining Vietnamese text in `src/features/history/components/HistoryFilterBar.tsx`
- [X] T064 [P] [US3] Update assertions in `src/features/history/pages/HistoryPage.test.tsx` to match translated history-page text
- [X] T065 [P] [US3] Translate remaining Vietnamese text in `src/features/history/pages/HistoryPage.tsx`
- [X] T066 [P] [US3] Translate remaining Vietnamese text in `src/features/history/api/historyClient.real.ts` — leave existing `I18nString.vi` field values (the `templateTitle` mapping) as-is per T005a's decision; only translate plain string fields
- [X] T067 [P] [US3] Translate remaining Vietnamese text in `src/features/history/components/HistoryPromptDetail.tsx`
- [X] T068 [P] [US3] Translate remaining Vietnamese text in `src/features/history/components/HistoryList.tsx`
- [X] T069 [P] [US3] Translate remaining Vietnamese text in `src/features/history/pages/FavoritesPage.tsx`
- [X] T070 [P] [US3] Update assertions in `src/features/history/pages/FavoritesPage.test.tsx` to match translated favorites-page text
- [X] T071 [P] [US3] Translate remaining Vietnamese text in `src/features/history/api/historyClient.mock.ts` — leave existing `I18nString.vi` field values as-is per T005a's decision; only translate plain string fields (e.g. `promptSnippet`, `finalPrompt`)
- [X] T072 [P] [US3] Translate remaining Vietnamese text in `src/features/history/components/FavoriteTemplateGrid.tsx`
- [X] T073 [P] [US3] Translate remaining Vietnamese text in `src/features/history/components/HistoryEmptyState.tsx`
- [X] T074 [P] [US3] Translate remaining Vietnamese text in `src/features/history/components/DeleteConfirmDialog.tsx`

### Implementation for User Story 3 — admin

- [X] T075 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/CategoryTree.tsx`
- [X] T076 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/AiModelForm.tsx`
- [X] T077 [P] [US3] Update assertions in `src/features/admin/pages/TemplatesAdminPage.test.tsx` to match translated templates-admin text
- [X] T078 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/pages/TemplatesAdminPage.tsx`
- [X] T079 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/context/AdminDataProvider.tsx`
- [X] T080 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/DashboardMetrics.tsx` (relies on T005a for `getI18nValue(item.titleI18n)` to render English)
- [X] T081 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/PromptsTrendChart.tsx`
- [X] T082 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/pages/DashboardPage.tsx`
- [X] T083 [P] [US3] Update assertions in `src/features/admin/pages/DashboardPage.test.tsx` to match translated dashboard text
- [X] T084 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/api/dashboardClient.mock.ts` — leave existing `I18nString.vi` field values as-is per T005a's decision; only translate plain string fields
- [X] T085 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/pages/AiModelsPage.tsx`
- [X] T086 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/pages/TaxonomyPage.tsx`
- [X] T087 [P] [US3] Update assertions in `src/features/admin/pages/AiModelsPage.test.tsx` to match translated AI-models text
- [X] T088 [P] [US3] Update assertions in `src/features/admin/pages/TaxonomyPage.test.tsx` to match translated taxonomy text
- [X] T089 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/AdminLayout.tsx`
- [X] T090 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/AiModelTable.tsx`
- [X] T091 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/TagTable.tsx`
- [X] T092 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/Pagination.tsx`
- [X] T093 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/api/templatesAdminClient.mock.ts` — leave existing `I18nString.vi` field values as-is per T005a's decision; only translate plain string fields
- [X] T094 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/ConfirmDialog.tsx`
- [X] T095 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/Modal.tsx`
- [X] T096 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/TemplateEditorForm.tsx`
- [X] T097 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/TemplateVariableEditor.tsx`
- [X] T098 [P] [US3] Update assertions in `src/features/admin/components/RequireAdmin.test.tsx` to match translated guard text
- [X] T099 [P] [US3] Translate remaining Vietnamese text in `src/features/admin/components/DateRangeFilter.tsx`

- [X] T100 [US3] Run `npm run test`, `npm run lint`, `npm run build`, then manually walk through history, favorites, and each admin page (per `quickstart.md` §4 P3), triggering a CRUD dialog and checking chart/table labels, to confirm English-only text (depends on T063–T099) — automated scan/lint/build clean; test suite has only 2 pre-existing, unrelated failures (App.test.tsx full-suite timeout flakiness — passes in isolation; HistoryPage.test.tsx missing HomeDataProvider wrap — confirmed present before this feature via `git stash`); manual browser walkthrough still pending (see Polish phase T103)

**Checkpoint**: All user stories are now independently functional and fully English

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Whole-app verification against spec Success Criteria after all stories are done

- [X] T101 Run a Unicode-aware scan for `[À-ỹ]` across `src/` and confirm zero matches remain (spec SC-001) — 9 files still match, all confirmed intentional/out-of-scope: `I18nString.vi` fields left in place per T005a's decision (templateClient.mock.ts, templateDetailClient.mock.ts, historyClient.mock.ts, historyClient.real.ts, dashboardClient.mock.ts, FavoritesPage.test.tsx), a code comment quoting an FR requirement (HistoryPromptDetail.tsx) and one quoting a wire-contract phrase (httpClient.ts) both out of scope per FR-006, and ProfileSettingsPage.tsx's "Tiếng Việt" language-picker option (an endonym naming an actual language choice, not app-chrome text). Note: `bash`'s `grep -P` under the C locale produces false positives on any multi-byte UTF-8 sequence (em dashes, curly quotes) — use the Grep tool (ripgrep) or an equivalent Unicode-aware matcher, not raw `grep -P`, when re-running this scan
- [X] T102 Run `npm run test`, `npm run lint`, and `npm run build` once more across the whole app and confirm all pass (spec SC-002, Constitution Principle V) — lint and build clean; test suite has the same 2 pre-existing, unrelated failures noted in T100 (not caused by this feature)
- [X] T103 Perform the full manual walkthrough in `quickstart.md` §4 across every screen (home/catalog, template detail, generate, auth, history, favorites, admin) and confirm English-only text in every state (spec SC-003) — dev server started at http://localhost:5173/; user manually walked through all screens in a real browser and confirmed everything renders correctly in English.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (shared shell renders on every screen)
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - Can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependency on US2/US3
- **User Story 2 (P2)**: Can start after Foundational — no dependency on US1/US3
- **User Story 3 (P3)**: Can start after Foundational — no dependency on US1/US2

### Within Each User Story

- All per-file translation tasks are independent of each other (different files) and marked [P]
- The final verification task in each story (T039, T062, T100) depends on every translation task in that story completing first
- Story complete before moving to the next priority (recommended for solo execution; parallel-safe for a team)

### Parallel Opportunities

- All Foundational tasks marked [P] (T002–T005) can run in parallel; T005a touches a different file so it can run alongside them too; T006 depends on T002–T005
- Once Foundational completes, all three user story phases can start in parallel if staffed
- Within any user story, every per-file task marked [P] can run in parallel (no two tasks touch the same file)

---

## Parallel Example: User Story 1

```bash
# Launch home/catalog translation tasks together:
Task: "Translate remaining Vietnamese text in src/features/home/components/TemplateCard.tsx"
Task: "Translate remaining Vietnamese text in src/features/home/components/FilterBar.tsx"
Task: "Translate remaining Vietnamese text in src/features/home/api/templateClient.mock.ts"

# Launch template-detail translation tasks together:
Task: "Translate remaining Vietnamese text in src/features/template-detail/components/TemplateHero.tsx"
Task: "Translate remaining Vietnamese text in src/features/template-detail/components/NewerVersionBadge.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run T039's checkpoint
5. Demo the fully-English home/catalog → detail → generate flow

### Incremental Delivery

1. Complete Setup + Foundational → shared shell is English
2. Add User Story 1 → verify independently (MVP!)
3. Add User Story 2 → verify independently
4. Add User Story 3 → verify independently
5. Complete Phase 6 → final whole-app verification against SC-001–SC-003

### Parallel Team Strategy

With multiple developers, once Foundational is done:
- Developer A: User Story 1 (home/catalog, detail, generate)
- Developer B: User Story 2 (auth)
- Developer C: User Story 3 (history/favorites, admin)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each translation task must preserve meaning and existing tone (spec FR-005) and must not change behavior/layout/logic (spec FR-004)
- Any task touching a `*.test.tsx`/`*.test.ts` file only updates the expected-text assertions to match its sibling file's new English strings — it does not add new test cases
- Commit after each user story phase (or logical group within it)
- Stop at any checkpoint (T039, T062, T100) to validate that story independently before continuing
