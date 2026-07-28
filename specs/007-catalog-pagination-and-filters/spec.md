# Feature Specification: Complete Catalog Browsing (Pagination, Sort, Category/Tag Filters)

**Feature Branch**: `007-catalog-pagination-and-filters`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "Hoàn thiện Epic 2 (Template Discovery & Browsing) trên trang Catalog theo đúng how2prompt-agentic/agent/BA.md US-2.1 và US-2.2: (1) phân trang thật cho grid "Toàn bộ thư viện" dựa trên page_info.next_cursor/has_next thay vì chỉ lấy cố định 50 kết quả đầu; (2) bộ chọn sắp xếp cho phép người dùng chọn "mới nhất" / "phổ biến nhất" thay vì hard-code sort=popular; (3) ưu tiên hiển thị template is_official=true lên đầu danh sách; (4) tách Category và Tag thành hai bộ lọc riêng biệt, độc lập với nhau (Category dùng API getCategories, Tag dùng API getTags — hiện tại UI đang gộp chung Category vào state "tag" và dùng sai tham số API), cả hai đều deep-link qua URL query string và compose AND logic với nhau và với search/model filter như US-2.2 yêu cầu."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visitor browses the entire library, not just the first page (Priority: P1)

A visitor (guest or member) scrolls through "Toàn bộ thư viện" and can keep
loading further results until every template in the library has been seen —
today the grid silently stops after the first batch and the rest of the
library is unreachable.

**Why this priority**: Without this, any library larger than one page is
partially invisible — the core "discover a template" job is broken for a
growing catalog, regardless of how good filtering/sorting are.

**Independent Test**: Seed more templates than fit in one page, load the
catalog, and confirm a visitor can keep advancing through results until the
full library has been shown, independent of any filter/sort choice.

**Acceptance Scenarios**:

1. **Given** the library has more templates than fit in one page, **When** a
   visitor reaches the end of the currently loaded results, **Then** they can
   trigger loading the next page and the newly loaded templates are appended
   to the grid.
2. **Given** a visitor has loaded every available page, **When** they reach
   the end of the grid, **Then** no further "load more" action is offered and
   the total-count badge matches the number of templates actually shown.
3. **Given** official templates exist alongside non-official ones, **When**
   the grid renders (in any page, any sort order), **Then** official
   templates are listed ahead of non-official templates.

---

### User Story 2 - Visitor chooses how the library is ordered (Priority: P1)

A visitor picks between "phổ biến nhất" (most popular) and "mới nhất"
(newest) to control how "Toàn bộ thư viện" is ordered — today the order is
fixed to popularity with no way to change it.

**Why this priority**: Sorting is one of the two explicit ordering controls
the requirements call for (alongside filtering) and is independent of
pagination/filtering — a visitor should be able to use it even before
pagination or the new filters are touched.

**Independent Test**: Load the catalog, switch the sort control between
"most popular" and "newest", and confirm the grid re-orders accordingly
without needing to touch any filter.

**Acceptance Scenarios**:

1. **Given** the catalog is showing templates sorted by "phổ biến nhất",
   **When** the visitor switches the sort control to "mới nhất", **Then** the
   grid re-renders ordered by creation recency (newest first).
2. **Given** a visitor has an active filter and/or is partway through
   pagination, **When** they change the sort order, **Then** the active
   filters are preserved and pagination restarts from the first page of the
   newly ordered results.
3. **Given** a visitor picks "mới nhất", **When** the grid renders, **Then**
   official templates still appear ahead of non-official ones (User Story 1's
   ordering rule holds under every sort choice).

---

### User Story 3 - Visitor filters by Category and by Tag independently (Priority: P1)

A visitor narrows the library using Category (broad topic grouping, e.g.
"Debugging") and Tag (a finer, cross-cutting label) as two separate filter
controls that can be combined with each other, with the AI-model filter, and
with search — today only one combined "tag" control exists and it is
actually wired to the Category list, so true Tag filtering doesn't work at
all.

**Why this priority**: This is the other half of US-2.2's explicit
requirement ("Filter by Category / Tag / AI Model") and, like sorting, is
usable on its own the moment it exists — it doesn't block or get blocked by
pagination/sort.

**Independent Test**: Load the catalog, select a Category, then separately
select a Tag, and confirm the grid narrows to templates matching both — then
clear one and confirm the other filter still applies alone.

**Acceptance Scenarios**:

1. **Given** the catalog is showing all templates, **When** a visitor selects
   a Category, **Then** the grid narrows to templates in that category and
   the URL query string reflects the selected category.
2. **Given** a Category filter is active, **When** the visitor also selects a
   Tag, **Then** the grid narrows further to templates matching both the
   Category and the Tag (AND logic), and the URL reflects both selections
   independently.
3. **Given** Category, Tag, Model, and Search filters are all active at once,
   **When** the visitor clears just one of them, **Then** the grid updates to
   match only the remaining active filters, and the URL query string drops
   only the cleared filter's parameter.
4. **Given** a visitor opens a URL with a Category and/or Tag query parameter
   already set, **When** the catalog page loads, **Then** the corresponding
   filter(s) are pre-selected and the grid is pre-filtered to match.

---

### Edge Cases

- What happens when a visitor changes a filter or the sort order while a
  "load more" request for the previous state is still in flight? The
  in-flight request's results must not be appended after the state has
  changed — only results matching the current filter/sort state may render.
- What happens when a Category or Tag referenced in the URL query string no
  longer exists (e.g., stale bookmark)? The invalid filter is ignored and the
  grid falls back to showing results for the remaining valid filters, same as
  the existing behavior for an unknown filter value.
- What happens when zero templates match the active Category + Tag + Model +
  Search combination? The existing empty-state message is shown, same as
  today's single-filter empty case.
- What happens when the total number of matching templates is smaller than
  one page? No "load more" control is shown, since there is nothing further
  to load.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The "Toàn bộ thư viện" grid MUST support retrieving additional
  pages of results beyond the first, continuing until every template
  matching the active filters has been made available to the visitor.
- **FR-002**: The system MUST stop offering further pagination once no
  further pages remain, and the displayed count MUST always reflect exactly
  what has been loaded so far versus the total matching count.
- **FR-003**: The catalog MUST provide a visible control letting the visitor
  choose between "phổ biến nhất" (most popular) and "mới nhất" (newest) as
  the grid's ordering; changing it MUST re-order the grid and restart
  pagination from the first page.
- **FR-004**: Within every sort order and every page, templates flagged as
  official MUST be listed ahead of non-official templates.
- **FR-005**: The catalog MUST provide two independent filter controls —
  Category and Tag — each sourced from its own distinct list of options (not
  from a single shared list), and each individually selectable/clearable.
- **FR-006**: The Category filter, Tag filter, AI-model filter, and search
  keyword MUST all compose with AND logic — the grid MUST only show
  templates matching every currently active filter/search term.
- **FR-007**: The active Category selection and the active Tag selection
  MUST each be reflected in the URL query string under their own distinct
  parameter, independently deep-linkable and independently clearable,
  consistent with how the existing model filter and search already behave.
- **FR-008**: Loading a catalog URL with Category and/or Tag query
  parameters already present MUST pre-select the matching filter(s) and
  pre-filter the grid on initial page load.
- **FR-009**: None of the above MAY regress the existing search (debounced
  full-text) or AI-model filter behavior, or the existing Featured/Trending
  rails, which remain unchanged by this feature.

### Key Entities _(include if feature involves data)_

- **Category**: A broad topic grouping a template belongs to (e.g.
  "Debugging", "Marketing"); already modeled in the codebase, previously
  mis-wired into the catalog's tag filter instead of its own control.
- **Tag**: A finer, cross-cutting label attachable to a template, distinct
  from Category; already modeled and already exposed by an existing API
  method that the catalog page does not yet call.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A visitor can reach 100% of the templates in the library
  through the catalog grid, not just the first batch, regardless of library
  size.
- **SC-002**: A visitor can switch between "most popular" and "newest"
  ordering and see the grid reflect the new order without a full page
  reload.
- **SC-003**: Official templates appear ahead of non-official templates in
  100% of observed page/sort combinations.
- **SC-004**: A visitor can independently combine Category, Tag, AI-model,
  and search filters and always see only templates matching every active
  condition.
- **SC-005**: Any combination of active Category, Tag, Model, and Sort
  selections is fully restorable by reloading the same URL — the visitor
  sees the identical filtered, sorted view they left.

## Assumptions

- "Official templates prioritized at the top" (BA.md US-2.1) applies within
  whatever sort order is currently selected — official templates are listed
  first, then the remaining templates follow the chosen sort (popularity or
  recency) — rather than official status overriding sort order entirely.
- Pagination is exposed as an explicit "load more" style action rather than
  automatic infinite-scroll, matching this app's existing interaction
  patterns (e.g. no infinite-scroll elsewhere in the app); either satisfies
  the underlying requirement that all results become reachable.
- The Tag list surfaced by the new Tag filter is the existing `getTags()` API
  method already defined in the template client — no new backend/API surface
  is assumed beyond what the client interface already declares.
- This feature is presentation + client-side query wiring only; it assumes
  the backend's `sort`, `category`, `tags`, and cursor-pagination parameters
  already behave as declared in the existing `TemplateClient` interface — no
  backend changes are in scope for this frontend repo.
- Out of scope: any change to the Featured/Trending rails, the AI-model
  filter, search behavior, or the template detail page — all untouched by
  this feature.
