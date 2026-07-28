# Tasks: View Template Details

**Input**: Design documents from `/specs/005-view-template-details/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Not requested in the feature specification. Test tasks are omitted.

**Scope**: Read-only template detail page (US-2.4 only). Dynamic form, live preview, and prompt generation (Epic 3) are OUT OF SCOPE.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create feature types, API client interface, mock/real implementations, and ensure shared utilities are available.

- [x] T001 Create `src/features/template-detail/types.ts` with domain types: `TemplateDetail`, `TemplateVersion`, `TemplateVariant` (read-only reference), `AiModel` (if not already shared)
- [x] T002 Create `src/features/template-detail/api/templateDetailClient.types.ts` with `TemplateDetailClient` interface (3 methods: getDetail, toggleFavorite, incrementViewCount)
- [x] T003 [P] Create `src/features/template-detail/api/templateDetailClient.mock.ts` with in-memory mock implementation using the template data from the mockup (debug-loi-hieu-qua template with gpt-4o + claude models, description, guide, example output)
- [x] T004 [P] Create `src/features/template-detail/api/templateDetailClient.real.ts` with real HTTP implementation using `apiFetch` from `@/shared/utils/httpClient`
- [x] T005 Create `src/features/template-detail/api/templateDetailClient.ts` factory that picks mock or real based on `VITE_API_BASE_URL`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the data-fetching hook, register the route, and ensure the page component structure exists. ALL user story work depends on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create `src/features/template-detail/hooks/useTemplateDetail.ts` — custom hook that takes a slug, calls `templateDetailClient.getDetail(slug)`, returns `{ template, isLoading, error, notFound }`. Handles loading/error/not-found states. Fires `incrementViewCount` as a fire-and-forget side-effect on successful load
- [x] T007 Create `src/features/template-detail/components/TemplateDetailPage.tsx` — main page component. Reads `:slug` from React Router `useParams`. Calls `useTemplateDetail(slug)`. Renders loading state, 404 state, error state, or the full detail page layout. Single-column stacked layout with sections for hero, models, guide, example, and meta
- [x] T008 Update `src/app/App.tsx` to add route: `/templates/:slug` → `TemplateDetailPage` from `@/features/template-detail/components/TemplateDetailPage`
- [x] T009 Create `src/features/template-detail/components/NotFoundState.tsx` — 404 state with message "Không tìm thấy mẫu" and a link back to catalog ("← Quay lại thư viện")

---

## Phase 3: User Story 1 — View template details (Priority: P1) 🎯 MVP

**Goal**: Visitor arrives at the detail page and sees all template information in read-only mode: back-link, page head, model tags, usage guide, example output, usage count, and favorite toggle (for signed-in users).

**Independent Test**: Navigate to `/templates/{slug}` and verify all sections render correctly with mock data — back-link, eyebrow badge, title, description, model tag pills, guide section, example output, usage count, and favorite toggle (for authenticated users). Verify loading and 404 states.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `src/features/template-detail/components/BackLink.tsx` — "← Quay lại thư viện" link styled per mockup's `.back-link` class. Navigates to catalog page (`/`). Uses `react-router-dom` `Link`
- [x] T011 [P] [US1] Create `src/features/template-detail/components/TemplateHero.tsx` — page head with eyebrow badge (primary category tag e.g., "#debugging"), template title, and description lede paragraph. Styled per mockup's `.page-head` and `.eyebrow` classes
- [x] T012 [P] [US1] Create `src/features/template-detail/components/ModelTags.tsx` — row of model tag pills displaying the template's `supported_models`. Each pill styled per mockup's `.model-tag` class (monospace, small, rounded). Reads model display names from a mapping (e.g., "gpt-4o" → "GPT-4o")
- [x] T013 [P] [US1] Create `src/features/template-detail/components/UsageGuide.tsx` — renders `current_version.guide` (I18nString) as a section. Uses `getI18nValue` for locale resolution. Section styled per mockup's `.output-box` pattern with a tag header
- [x] T014 [P] [US1] Create `src/features/template-detail/components/ExampleOutput.tsx` — renders `current_version.example_output` (I18nString) as a section showing a sample generated prompt. Uses `getI18nValue`. Section styled per mockup's `.output-box` pattern
- [x] T015 [P] [US1] Create `src/features/template-detail/components/TemplateMeta.tsx` — displays usage count (locale-formatted, e.g., "482 lượt dùng") and favorite toggle button (heart icon ♡/♥). Favorite toggle hidden for guests. Toggle calls `templateDetailClient.toggleFavorite(templateId)`. Shows toast on toggle. Styled per mockup's `.fav-btn` and `.usage-count`
- [x] T016 [US1] Integrate all US1 components into `TemplateDetailPage.tsx` — wire BackLink at top, TemplateHero below, ModelTags below hero, UsageGuide and ExampleOutput in main content area, TemplateMeta at bottom. Pass data from `useTemplateDetail` hook. Handle loading skeleton, 404 state (NotFoundState), and error state

**Checkpoint**: At this point, User Story 1 is fully functional — the detail page renders all template information sections in read-only mode with mock data, matching the design mockup.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements that affect the entire feature

- [x] T017 [P] Ensure dark mode renders correctly across all template-detail components — verify color tokens match the mockup's `:root[data-theme="dark"]` values (dark backgrounds, light text, accent color)
- [x] T018 [P] Ensure responsive layout works on mobile viewports (< 860px) — verify content stacks vertically, no horizontal scrolling, all sections accessible
- [x] T019 Run `npm run lint`, `npm run build`, and `npm run test` — fix any issues
- [x] T020 Run quickstart.md validation scenarios 1-10 in a browser to confirm end-to-end behavior matches the design mockup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types, client interface, mock/real implementations)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (hook, route, page component exist)
- **Polish (Phase 4)**: Depends on User Story 1 being complete

### User Story Dependencies

- **User Story 1 (View Details)**: Single user story — no cross-story dependencies.

### Within Each User Story

- Types/interfaces before components
- Components before page assembly
- Page integration before polish

### Parallel Opportunities

- **Phase 1**: T003 and T004 can run in parallel (mock vs. real client)
- **Phase 3**: T010, T011, T012, T013, T014, T015 can all run in parallel (6 independent components, different files)
- **Phase 4**: T017 and T018 can run in parallel (dark mode vs. responsive)

---

## Parallel Example: User Story 1

```bash
# Launch all six component tasks together (different files, no dependencies):
Task: "Create BackLink.tsx in src/features/template-detail/components/"
Task: "Create TemplateHero.tsx in src/features/template-detail/components/"
Task: "Create ModelTags.tsx in src/features/template-detail/components/"
Task: "Create UsageGuide.tsx in src/features/template-detail/components/"
Task: "Create ExampleOutput.tsx in src/features/template-detail/components/"
Task: "Create TemplateMeta.tsx in src/features/template-detail/components/"

# Then integrate into the page:
Task: "Wire all US1 components into TemplateDetailPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, client, factory)
2. Complete Phase 2: Foundational (hook, route, page component, 404)
3. Complete Phase 3: User Story 1 (back-link, hero, model tags, guide, example, meta)
4. **STOP and VALIDATE**: Open `/templates/{slug}` in browser, verify detail page renders all sections with mock data
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready (types, client, hook, route)
2. Phase 3 (US1 View Details) → Detail page renders in read-only mode → Deploy/Demo (MVP!)
3. Phase 4 (Polish) → Dark mode, responsive, final validation → Ship

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to user story for traceability
- This feature is strictly read-only — no dynamic form, no preview, no generate (Epic 3 is out of scope)
- All displayed copy is Vietnamese per the mockup and project conventions
- The mockup (`docs/design/how2prompt-workspace-mockup.html`) is the visual source of truth — match its CSS tokens, spacing, and interaction patterns exactly
- Commit after each task or logical group
- Stop at any checkpoint to validate in a browser
