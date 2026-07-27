# Feature Specification: Home — Template Catalog (Browse, Filter, Search)

**Feature Branch**: `feature/home-catalog` (new)

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Cập nhật lại spec cho trang Home dựa trên các user story US-2.1 (browse the template library), US-2.2 (filter by category/tag/AI model), US-2.3 (full-text search templates). Giao diện phải bám sát chính xác thiết kế trong how2prompt-workspace-mockup.html và docs/design/README.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Guest browses the template library (Priority: P1)

A visitor (authenticated or not) opens the Home page and sees a curated, browsable
catalog of public templates. The page loads immediately with templates organized into
three visual tiers: a horizontally-scrolling "Featured" rail curated by admins, a
horizontally-scrolling "Trending" rail showing templates popular in the last 7 days,
and a full grid of all matching templates below. Each template card shows its title,
short description, an "Official" badge when applicable, which AI models it targets,
and its total usage count.

**Why this priority**: Browsing is the primary entry point for every visitor. Without
the catalog rendering correctly with real template data, no other Epic 2/3 capability
can be reached.

**Independent Test**: Can be fully tested today by navigating to the Home page and
verifying that template cards render in the Featured rail, Trending rail, and full
grid with correct metadata — using mocked template data until the real API is
available.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to the Home page, **When** the page finishes
   loading, **Then** they see a page head with a greeting (personalized for signed-in
   users, generic for guests), a section for Featured templates, a section for
   Trending templates, and a full library grid — all populated with template cards.
2. **Given** a visitor views a template card, **When** they look at it, **Then** they
   can see the template's title, short description, whether it is "Chính thức"
   (official), which AI models it supports (shown as small tags), and its total usage
   count.
3. **Given** a visitor clicks a template card, **When** the click registers, **Then**
   the application navigates to the template detail page (out of scope for this
   feature; handled by Epic 3).
4. **Given** a guest (not signed in) views the Home page, **When** the page loads,
   **Then** the greeting reads "Tìm mẫu prompt phù hợp — đăng nhập để lưu lịch sử"
   and the top bar does not show a user chip.
5. **Given** a signed-in user views the Home page, **When** the page loads, **Then**
   the greeting reads "Chào {display_name}, tìm mẫu prompt phù hợp" and the top bar
   shows their avatar and display name.
6. **Given** a visitor views the Home page, **When** they look at the page head,
   **Then** an eyebrow badge reads "templates · guest & member" indicating both roles
   can access this page.

---

### User Story 2 — Visitor filters templates by category, tag, or AI model (Priority: P1)

A visitor wants to narrow down the catalog to templates relevant to their current
need. They can select a target AI model from a dropdown, toggle one or more category
tag chips, and the grid updates instantly. The URL query string updates to reflect the
active filters so the filtered view can be shared or bookmarked. A count badge shows
how many templates match the current filter combination.

**Why this priority**: Filtering is the primary way visitors refine the catalog.
Without it, the catalog is a flat list that becomes unmanageable as template count
grows. It depends on the catalog grid from Story 1 being in place.

**Independent Test**: Can be fully tested today by selecting a model from the
dropdown, toggling tag chips, and verifying the grid narrows — using mocked data
until the real API is available.

**Acceptance Scenarios**:

1. **Given** a visitor is on the Home page, **When** they select a specific AI model
   from the dropdown (e.g., "Claude"), **Then** the grid updates to show only
   templates compatible with that model, and the count badge reflects the filtered
   total.
2. **Given** a visitor is on the Home page, **When** they click a tag chip (e.g.,
   "#debugging"), **Then** the chip becomes active (indigo background, white text),
   the grid narrows to templates with that tag, and the URL query string updates
   (e.g., `?tag=debugging`).
3. **Given** a visitor has active filters, **When** they click "Tất cả" (the default
   tag chip), **Then** the tag filter resets, the grid shows all templates matching
   any remaining filters, and the URL query string is updated accordingly.
4. **Given** a visitor has active filters, **When** they select "Tất cả model AI" from
   the dropdown, **Then** the model filter resets and the grid shows all templates
   matching any remaining tag filters.
5. **Given** a visitor has both a model filter and tag filters active, **When** the
   grid renders, **Then** only templates matching ALL active filters are shown
   (AND logic, not OR).
6. **Given** a visitor has active filters and the filtered results are empty, **When**
   the grid renders, **Then** an empty state message appears: "Không tìm thấy mẫu
   phù hợp — thử từ khóa hoặc bộ lọc khác."
7. **Given** a visitor has active filters, **When** they open the URL with the query
   string parameters in a new tab or share it, **Then** the same filters are
   restored on page load and the grid shows the same filtered results.

---

### User Story 3 — Visitor searches templates by keyword (Priority: P1)

A visitor wants to find templates related to a specific topic by typing a keyword
into a search box. Results update after a short debounce delay. The search is
forgiving of typos (fuzzy matching) and works across both English and Vietnamese.

**Why this priority**: Search is the fastest path to finding a known template. It is
independent of filters (Story 2) but works alongside them. Without search, visitors
must visually scan the full grid.

**Independent Test**: Can be fully tested today by typing a keyword into the search
box, waiting for the debounce, and verifying results appear — using mocked data until
the real API is available.

**Acceptance Scenarios**:

1. **Given** a visitor types a keyword (e.g., "email marketing") into the search box,
   **When** they stop typing for 300ms, **Then** the grid updates to show only
   templates whose title or description matches the keyword.
2. **Given** a visitor types a keyword with a typo (e.g., "maketing" instead of
   "marketing"), **When** the search executes, **Then** fuzzy matching returns
   relevant results despite the misspelling.
3. **Given** a visitor has an active tag filter and types a search keyword, **When**
   the results render, **Then** only templates matching BOTH the search keyword AND
   the active tag filter are shown (search and filters compose with AND logic).
4. **Given** a visitor clears the search box, **When** the input becomes empty, **Then**
   the grid reverts to showing all templates (subject to any active tag/model
   filters).
5. **Given** a visitor types a search keyword, **When** the search box has focus,
   **Then** a magnifier icon is visible inside the search box as a visual cue.
6. **Given** a visitor types a search that returns no results, **When** the empty
   state renders, **Then** the message "Không tìm thấy mẫu phù hợp — thử từ khóa
   hoặc bộ lọc khác." is displayed.

---

### Edge Cases

- What happens when a visitor types a very long search query (e.g., 200+ characters)?
  → The search input accepts it and the query is sent; the backend handles
  truncation or rejection if needed.
- What happens when a visitor rapidly toggles multiple filter chips? → Each toggle
  triggers a re-render with the current filter state; no race conditions or stale
  results are shown.
- What happens when the API returns an error during search or filter? → The grid
  shows the last successful result set; an inline, non-blocking error message is
  shown near the search box.
- What happens when a template is soft-deleted while a visitor is viewing the
  catalog? → The template disappears from the grid on the next fetch; no error is
  shown to the visitor.
- What happens when a visitor navigates to the Home page with invalid URL query
  parameters (e.g., `?tag=nonexistent`)? → The invalid parameters are ignored; the
  grid shows all templates as if no filters were active.
- What happens when a guest (not signed in) views the catalog? → All public
  templates are visible; the favorite toggle on template cards is hidden or disabled
  for guests.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Home page MUST display a page head with an eyebrow badge
  ("templates · guest & member"), a greeting line, and a lede paragraph describing the
  page purpose.
- **FR-002**: The greeting line MUST be personalized with the signed-in user's display
  name when authenticated, or show the generic guest copy when not authenticated.
- **FR-003**: The page MUST display a horizontally-scrolling "Featured" section with a
  section header ("Nổi bật") and a subtitle ("chọn bởi Admin"), showing template
  cards marked as `featured` in the data.
- **FR-004**: The page MUST display a horizontally-scrolling "Trending" section with a
  section header ("Thịnh hành 7 ngày qua") and a count badge showing the number of
  trending templates.
- **FR-005**: The page MUST display a full grid section with a section header ("Toàn
  bộ thư viện") and a count badge showing the number of matching templates out of the
  total (e.g., "4 / 4 mẫu").
- **FR-006**: Each template card MUST display: title, short description, an official
  badge ("Chính thức") when `is_official` is true, AI model tags, and a usage count.
- **FR-007**: Each template card MUST include a favorite toggle button (heart icon).
  For guests, this toggle MUST be hidden. For signed-in users, clicking it toggles
  the favorite state and shows a toast confirmation.
- **FR-008**: Clicking a template card MUST navigate to the template detail page (the
  route is out of scope for this feature; only the navigation trigger is in scope).
- **FR-009**: A search input field MUST be present in the filter bar, with a magnifier
  icon inside it. Typing into the search box MUST trigger a filtered view after a
  300ms debounce.
- **FR-010**: The search MUST match against template titles and descriptions. Results
  MUST be relevant to the typed keyword, supporting fuzzy matching for typos.
- **FR-011**: A model filter dropdown MUST be present next to the search box, with
  "Tất cả model AI" as the default option. Selecting a model MUST filter the grid to
  only templates compatible with that model.
- **FR-012**: Tag filter chips MUST be displayed below the search row. Each chip MUST
  be a toggle button: inactive state (white background, gray border) and active state
  (indigo background, white text). Clicking a chip toggles it; "Tất cả" is the
  default active chip.
- **FR-013**: The active tag filter(s) and model filter MUST be reflected in the URL
  query string (e.g., `?tag=debugging&model=claude`) so the filtered view is
  deep-linkable and shareable.
- **FR-014**: Filters (tag, model) and search MUST compose with AND logic: the grid
  shows only templates matching ALL active filters AND the search keyword.
- **FR-015**: When filters or search produce zero results, the page MUST display an
  empty state message: "Không tìm thấy mẫu phù hợp — thử từ khóa hoặc bộ lọc khác."
- **FR-016**: The search input MUST be cleared when the visitor deletes all text,
  reverting the grid to show all templates (subject to active tag/model filters).
- **FR-017**: The top bar MUST display the brand mark ("{ } How2Prompt"), navigation
  links ("Thư viện" as the active/current page, "Lịch sử"), and (for signed-in
  users) a user chip with avatar, display name, and "Đăng xuất" link.
- **FR-018**: The top bar MUST NOT display the user chip for guests; instead, a
  "Tiếp tục với vai trò Khách →" link is shown (or hidden when already in the app
  view).
- **FR-019**: The Home page MUST use standard boxed form controls (search input,
  dropdown, toggle chips) — NOT the inline fill-in-the-blank pattern used on auth
  screens, per the project's interaction pattern rules.
- **FR-020**: The Home page MUST render correctly in both light and dark presentation
  modes, using the project's approved color tokens (cool paper neutrals, indigo
  accent).
- **FR-021**: The Featured and Trending sections MUST render as horizontal scroll
  rails with thin scrollbar styling, not as wrapped grids.

### Key Entities

- **Template**: A public prompt template — identified by a unique ID, with a title,
  short description, body containing `{{variable}}` placeholders, category/tag
  associations, AI model compatibility list, official status flag, featured flag,
  trending flag, and a usage count. This is the primary entity the catalog displays.
- **Category/Tag**: A label attached to templates for discovery. The catalog displays
  tags as toggle chips. The URL query string uses the tag's slug as its value.
- **AI Model**: A target AI model (e.g., GPT-4o, Claude, Gemini) that a template is
  compatible with. The catalog displays model compatibility as small tags on template
  cards and offers a dropdown filter by model.
- **Favorite**: A per-user association between a signed-in user and a template. Only
  available to authenticated users. Toggling a favorite is a client-side action that
  calls the API; the heart icon reflects the current state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can go from opening the Home page to seeing a fully populated
  template catalog (Featured rail, Trending rail, and full grid) within 2 seconds of
  page load under normal network conditions.
- **SC-002**: A visitor can narrow the catalog from the full set to a specific subset
  (e.g., all Claude-compatible debugging templates) in under 5 seconds using the
  filter controls.
- **SC-003**: A visitor can find a template by typing a keyword and seeing relevant
  results within 1 second of stopping typing (including the 300ms debounce).
- **SC-004**: 100% of active filter combinations are accurately reflected in the URL
  query string, and navigating to that URL restores the exact same filtered view.
- **SC-005**: A visitor can share a filtered catalog URL with another visitor, who
  sees the same filtered results on page load.
- **SC-006**: The empty state message appears within 500ms of the filter/search
  producing zero results.
- **SC-007**: Template cards are readable and interactive in both light and dark
  presentation modes, with no text or control becoming illegible.

## Assumptions

- The real template data will come from `GET /api/v1/templates` (see
  `docs/api/openapi.yaml`). Until that endpoint is available, all catalog data is
  mocked using representative template objects matching the shape defined in
  `how2prompt-agentic/agent/BA.md` (template body, `template_variables` JSONB, model
  associations).
- Template "Featured" and "Trending" status are properties set by the backend/Admin.
  The catalog page renders them in the correct sections; it does not compute them.
- The search functionality relies on a backend `search_vector` column and `pg_trgm`
  fuzzy matching. The frontend only needs to send the keyword; the backend handles
  ranking and fuzzy matching.
- The route for the Home/catalog page is `/` (the root path) or `/explore`, per the
  project's routing conventions. The exact route is determined during implementation.
- The "favorite" toggle is a simple heart icon on each template card. The full
  favorites management (viewing all favorited templates) is out of scope for this
  feature and may be a separate story.
- The Featured and Trending sections use horizontal scroll rails (not wrapped grids)
  as shown in the design mockup. The full library section uses a responsive CSS grid
  (`grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`).
- All displayed copy (labels, section headers, empty states, badges) is in Vietnamese,
  consistent with the approved mockup and project conventions.
