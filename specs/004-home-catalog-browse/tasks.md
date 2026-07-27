# Tasks: Home — Template Catalog (Browse, Filter, Search)

**Input**: Design documents from `/specs/004-home-catalog-browse/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Not requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Promote shared utilities, create shared types, and establish the foundation that all catalog work depends on.

- [x] T001 Move `src/features/auth/api/httpClient.ts` to `src/shared/utils/httpClient.ts` and update all imports in `features/auth/api/*.ts` to use `@/shared/utils/httpClient`
- [x] T002 Create `src/shared/types/api.ts` with shared types: `I18nString`, `PageInfo`, `ApiError` (re-export from httpClient)
- [x] T003 Create `src/shared/utils/i18n.ts` with `getI18nValue(obj: I18nString, locale?: string): string` — reads `obj.vi ?? obj.en ?? ''`
- [x] T004 [P] Create `src/shared/hooks/useDebounce.ts` — generic `useDebounce<T>(value: T, delay: number): T` hook using useState + useEffect with setTimeout/clearTimeout

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Template client interface, mock/real implementations, TopBar component, and app shell upgrade. ALL user stories depend on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `src/features/home/types.ts` with domain types: `TemplateListItem`, `AuthorBrief`, `Category`, `Tag`, `AiModel`, `CatalogFilters`, `CatalogPageData`
- [x] T006 Create `src/features/home/api/templateClient.types.ts` with `TemplateClient` interface (7 methods: getTemplates, getFeatured, getTrending, getModels, getCategories, getTags, toggleFavorite)
- [x] T007 [P] Create `src/features/home/api/templateClient.mock.ts` with in-memory mock implementation using hardcoded template data matching the mockup (4 templates: debugging, writing, marketing, coding)
- [x] T008 [P] Create `src/features/home/api/templateClient.real.ts` with real HTTP implementation using `apiFetch` from `@/shared/utils/httpClient`
- [x] T009 Create `src/features/home/api/templateClient.ts` factory that picks mock or real based on `VITE_API_BASE_URL`
- [x] T010 Create `src/shared/components/TopBar.tsx` — brand mark "{ } How2Prompt", nav links ("Thư viện" active, "Lịch sử"), user chip (avatar + name + logout) for signed-in users, or guest link for guests. Reads auth state via `useAuth()`
- [x] T011 Update `src/app/layout/RootLayout.tsx` to render `TopBar` instead of the current inline session display

**Checkpoint**: Foundation ready — shared types, HTTP client, template client, and app shell are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Browse the template library (Priority: P1) 🎯 MVP

**Goal**: Visitor opens the Home page and sees template cards in a Featured rail, Trending rail, and full grid — with correct metadata and layout matching the design mockup.

**Independent Test**: Navigate to `/` and verify template cards render in all three sections with title, description, official badge, model tags, and usage count.

### Implementation for User Story 1

- [x] T012 [P] [US1] Create `src/features/home/components/TemplateCard.tsx` — single card: title, description, official badge ("Chính thức" when `is_official`), model tags, usage count. Must use standard boxed layout matching the mockup's `.template-card` design (border-radius 14px, padding, hover effect with translateY(-2px))
- [x] T013 [P] [US1] Create `src/features/home/components/TemplateRail.tsx` — horizontal scroll container for featured/trending rails with thin scrollbar styling (`.rail` from mockup). Renders a section header + horizontal overflow of TemplateCards
- [x] T014 [P] [US1] Create `src/features/home/components/TemplateGrid.tsx` — responsive CSS grid (`grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`) rendering TemplateCards. Shows count badge (e.g., "4 / 4 mẫu")
- [x] T015 [US1] Create `src/features/home/pages/CatalogPage.tsx` — main catalog page with: page head (eyebrow "templates · guest & member", greeting personalized per auth state, lede paragraph), Featured rail, Trending rail, full grid. Fetches data from templateClient on mount. Replace the existing `HomePage` stub
- [x] T016 [US1] Update `src/app/App.tsx` to import `CatalogPage` from `@/features/home/pages/CatalogPage` instead of the old `HomePage`

**Checkpoint**: At this point, User Story 1 is fully functional — the catalog page renders with all three sections using mock data, matching the design mockup.

---

## Phase 4: User Story 2 — Filter by category, tag, or AI model (Priority: P1)

**Goal**: Visitor can filter the catalog using a model dropdown and tag chips, with filters reflected in the URL query string for deep-linking.

**Independent Test**: Select a model and tag chip, verify the grid narrows and the URL updates. Open the URL in a new tab and verify the same filters are restored.

### Implementation for User Story 2

- [x] T017 [P] [US2] Create `src/features/home/hooks/useCatalogFilters.ts` — custom hook using `useSearchParams` from React Router. Owns filter state (tag, model) synced to URL. Provides `setTag(slug)`, `setModel(code)`, `resetFilters()`. Reads initial state from URL on mount (deep-link support)
- [x] T018 [P] [US2] Create `src/features/home/components/ModelFilter.tsx` — `<select>` dropdown styled per mockup's `.model-select`. Options loaded from `getModels()`. Default: "Tất cả model AI" (value `''`). Calls `setModel` from `useCatalogFilters`
- [x] T019 [P] [US2] Create `src/features/home/components/TagFilterChips.tsx` — row of toggle chips styled per mockup's `.chip` / `.chip[aria-pressed="true"]`. Loads tags from `getCategories()` or `getTags()`. Default: "Tất cả" active. Calls `setTag` from `useCatalogFilters`. Active chip gets indigo background + white text
- [x] T020 [US2] Create `src/features/home/components/FilterBar.tsx` — container holding ModelFilter + TagFilterChips in a vertical stack (`.filter-bar` from mockup). Renders search row (model dropdown + any future search box) and chip row below
- [x] T021 [US2] Integrate `useCatalogFilters` into `CatalogPage.tsx` — pass debounced filter values to templateClient calls. Apply AND logic: template matches if (tag is empty OR template has tag) AND (model is empty OR template supports model)
- [x] T022 [US2] Add `is_favorited` toggle to `TemplateCard.tsx` — heart icon button (♡/♥). Hidden for guests. Calls `toggleFavorite()` from templateClient. Shows toast on toggle

**Checkpoint**: At this point, User Stories 1 AND 2 both work — catalog renders with filter controls, URL deep-linking, and favorite toggle.

---

## Phase 5: User Story 3 — Full-text search templates (Priority: P1)

**Goal**: Visitor can type a keyword in a search box, see results after 300ms debounce, with search composing with active filters using AND logic.

**Independent Test**: Type "email" in the search box, verify results appear after debounce. Clear search, verify grid reverts. Combine search + model filter and verify AND logic.

### Implementation for User Story 3

- [x] T023 [US3] Create `src/features/home/components/SearchBox.tsx` — search input with magnifier icon (⌕) inside it, styled per mockup's `.search-box`. Accepts `value` and `onChange` props. Calls `setSearch` from `useCatalogFilters`
- [x] T024 [US3] Integrate `useDebounce` into `FilterBar.tsx` — debounce the raw search value from `useCatalogFilters` with 300ms delay. Pass debounced value to templateClient query. Clear search reverts grid to full results (subject to tag/model filters)
- [x] T025 [US3] Add empty state to `CatalogPage.tsx` — when filtered results are empty, show `EmptyState` component with message "Không tìm thấy mẫu phù hợp — thử từ khóa hoặc bộ lọc khác."
- [x] T026 [US3] Create `src/features/home/components/EmptyState.tsx` — simple centered text component styled per mockup's `.empty-state`

**Checkpoint**: All three user stories are now independently functional — browse, filter, and search all work together with AND logic.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements that affect multiple user stories

- [x] T027 [P] Ensure dark mode renders correctly across all catalog components — verify color tokens match the mockup's `:root[data-theme="dark"]` values
- [x] T028 [P] Add responsive breakpoints for the catalog grid and filter bar on mobile viewports
- [x] T029 Run `npm run lint`, `npm run build`, and `npm run test` — fix any issues
- [x] T030 Run quickstart.md validation scenarios 1-8 in a browser to confirm end-to-end behavior matches the design mockup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (httpClient relocated, shared types created)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (template client, TopBar, types)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (CatalogPage exists, TemplateCard exists)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (FilterBar exists, useCatalogFilters exists)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (Browse)**: Can start after Phase 2. Independent foundation — renders the catalog.
- **User Story 2 (Filter)**: Depends on US1 (needs CatalogPage and TemplateCard to exist). Adds filter controls on top of the existing catalog.
- **User Story 3 (Search)**: Depends on US2 (needs FilterBar and useCatalogFilters). Adds search input to the existing filter bar.

### Within Each User Story

- Types/interfaces before components
- Components before page assembly
- Page integration before polish

### Parallel Opportunities

- **Phase 1**: T003 and T004 can run in parallel (different files)
- **Phase 2**: T007 and T008 can run in parallel (mock vs. real client)
- **Phase 3**: T012, T013, T014 can all run in parallel (different components, no dependencies)
- **Phase 4**: T017, T018, T019 can all run in parallel (hook + two filter components)
- **Phase 6**: T027 and T028 can run in parallel (dark mode vs. responsive)

---

## Parallel Example: User Story 1

```bash
# Launch all three component tasks together (different files, no dependencies):
Task: "Create TemplateCard.tsx in src/features/home/components/"
Task: "Create TemplateRail.tsx in src/features/home/components/"
Task: "Create TemplateGrid.tsx in src/features/home/components/"

# Then assemble the page:
Task: "Create CatalogPage.tsx in src/features/home/pages/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (shared infrastructure)
2. Complete Phase 2: Foundational (template client, TopBar, types)
3. Complete Phase 3: User Story 1 (Browse)
4. **STOP and VALIDATE**: Open `/` in browser, verify catalog renders with mock data
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready (shared types, HTTP client, template client)
2. Phase 3 (US1 Browse) → Catalog renders → Deploy/Demo (MVP!)
3. Phase 4 (US2 Filter) → Filters work with URL sync → Deploy/Demo
4. Phase 5 (US3 Search) → Search works with debounce + AND logic → Deploy/Demo
5. Phase 6 (Polish) → Dark mode, responsive, final validation → Ship

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together
2. Once Phase 2 is done:
   - Developer A: Phase 3 (US1 Browse) — builds catalog page
   - Developer B: Can prepare FilterBar/SearchBox components in isolation (no integration yet)
3. After US1 merges:
   - Developer A: Phase 4 (US2 Filter) — integrates filters into catalog
   - Developer B: Phase 5 (US3 Search) — integrates search into filter bar
4. Phase 6: Both polish together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story builds on the previous one (US2 adds filters to US1's catalog, US3 adds search to US2's filter bar)
- All displayed copy is Vietnamese per the mockup and project conventions
- The mockup (`docs/design/how2prompt-workspace-mockup.html`) is the visual source of truth — match its CSS tokens, spacing, and interaction patterns exactly
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently in a browser
