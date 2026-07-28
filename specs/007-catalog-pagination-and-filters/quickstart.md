# Quickstart: Validating Catalog Pagination, Sort, and Category/Tag Filters

Validation guide, not a build guide — proves the five success criteria in
`spec.md` hold. Full implementation steps live in `tasks.md`.

## Prerequisites

- `npm install` (already done in this repo).
- No `VITE_API_BASE_URL` set, so the app runs against `templateClient.mock.ts`
  — no backend needed. The mock data must include enough templates to exceed
  one page (verify `MOCK_TEMPLATES.length` > the mock's `size` default, or
  temporarily lower the mock's default `size` for this manual check).

## 1. Automated regression suite

```bash
npm run lint
npm run build
npm run test -- --run
```

Expected: all pass, confirming FR-009 (no regression to search, model
filter, Featured/Trending) and Constitution Principle V.

## 2. Pagination (User Story 1 / SC-001, SC-003)

1. `npm run dev`, open the catalog page.
2. Confirm "Toàn bộ thư viện" initially shows the first page and a "Xem
   thêm" control is visible under the grid.
3. Click "Xem thêm" repeatedly; confirm each click appends the next page's
   templates without duplicating or losing any already-shown template.
4. Once every template has loaded, confirm the "Xem thêm" control
   disappears and the count badge reads `N / N mẫu` (loaded == total).
5. Confirm official-flagged templates (`is_official: true` in mock data)
   appear before non-official ones across every loaded page.

## 3. Sort (User Story 2 / SC-002)

1. With some templates loaded, switch the sort control from "Phổ biến nhất"
   to "Mới nhất".
2. Confirm the grid resets to the first page and re-orders by `created_at`
   descending (newest first), with official templates still listed first
   within that order (drift-check against research.md's decision).
3. Apply a Category or Tag filter, then change sort again — confirm the
   active filter is preserved and only the order/pagination reset.

## 4. Category and Tag filters (User Story 3 / SC-004, SC-005)

1. Select a Category chip — confirm the grid narrows and the URL gains
   `?category=<slug>`.
2. With the Category still active, select a Tag chip — confirm the grid
   narrows further (AND logic) and the URL now has both `?category=<slug>`
   and `&tag=<slug>` as independent params.
3. Add a search keyword and/or the model filter on top — confirm all four
   conditions compose (AND) correctly.
4. Clear only the Tag filter — confirm the grid reverts to Category-only
   filtering and the URL drops just the `tag` param, keeping `category`.
5. Copy the current URL (with `category`, `tag`, `model`, `sort` all set),
   reload the page directly at that URL — confirm every filter/sort control
   is pre-selected and the grid matches exactly what was showing before
   reload.

## Pass criteria

SC-001 through SC-005 in `spec.md` all hold, and `npm run lint` / `build` /
`test -- --run` are clean.
