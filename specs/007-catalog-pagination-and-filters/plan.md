# Implementation Plan: Complete Catalog Browsing (Pagination, Sort, Category/Tag Filters)

**Branch**: `007-catalog-pagination-and-filters` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-catalog-pagination-and-filters/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Complete Epic 2's catalog browsing requirements (US-2.1/US-2.2) by adding real
"load more" pagination, a most-popular/newest sort control, official-first
ordering, and two independent Category/Tag filters to the existing Catalog
page — all client-side query/state wiring plus the mock client's in-memory
logic, no new screens. Phase 0 research surfaced that the existing
`TemplateClient.getTemplates` pagination shape (`cursor`/`next_cursor`) does
not match `docs/api/openapi.yaml`'s actual offset-based `page`/`size` +
`PageMeta` contract, so this plan also corrects that mismatch as a
prerequisite for building pagination that will actually work against the real
backend.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19

**Primary Dependencies**: React Router 7 (`useSearchParams` for URL-synced
filter/sort state, already the pattern in `useCatalogFilters.ts`), Vite 8,
Tailwind CSS v4 (inline arbitrary values, reusing the existing `.chip`/
`.model-select` visual patterns already implemented for the model filter —
see `docs/design/how2prompt-workspace-mockup.html`)

**Storage**: N/A — no persistence layer in this repo; the mock client's
in-memory `MOCK_TEMPLATES`/`MOCK_CATEGORIES` arrays gain a `MOCK_TAGS` array
and per-template `tags` field (see data-model.md)

**Testing**: Vitest + Testing Library, extending the existing
`CatalogPage.test.tsx` smoke test with cases for the new sort control,
Category/Tag filter composition, and pagination "load more" affordance

**Target Platform**: Web browser (existing SPA), mock-client dev mode by
default (no `VITE_API_BASE_URL`), real client path corrected to match the
documented backend contract

**Project Type**: Web frontend (single Vite/React SPA), no backend in this
repo

**Performance Goals**: No new performance targets; "load more" must not
re-fetch or re-render already-loaded pages (FR-001/FR-002)

**Constraints**: Every new/changed query param (`category`, `tags`, `sort`,
`page`) must round-trip through the URL query string (FR-007/FR-008); the
real client's request/response shape must match `docs/api/openapi.yaml`
exactly (Constitution Principle III); no change to Featured/Trending rails,
search, model filter, or the template detail page (FR-009)

**Scale/Scope**: 1 screen, ~9 files:
- `src/shared/types/api.ts` (`PageInfo` → align with `PageMeta`)
- `src/features/home/types.ts` (`TemplateListItem.tags`, drop unused
  `CatalogPageData`)
- `src/features/home/api/templateClient.types.ts` (`getTemplates` params/
  response shape)
- `src/features/home/api/templateClient.real.ts` (page/size query params,
  response mapped from `{data, meta}`)
- `src/features/home/api/templateClient.mock.ts` (category vs tags filtering,
  sort application, official-first ordering, page/size slicing, `MOCK_TAGS`)
- `src/features/home/hooks/useCatalogFilters.ts` (add `category`, `tag`,
  `sort` URL-synced state alongside existing `model`/`search`)
- `src/features/home/components/FilterBar.tsx` (compose Category select +
  Tag chips + Model select + sort control)
- `src/features/home/components/TagFilterChips.tsx` → rename/refactor into a
  reusable chip-group driven by whichever list (Category or Tag) is passed in
- `src/features/home/pages/CatalogPage.tsx` (wire sort control, load-more,
  pass corrected params to `getTemplates`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dynamic Form Rendering Integrity** — N/A. No `template_variables`-driven
  form is touched. Pass.
- **II. Spec-Before-Code** — Satisfied by this spec → plan → tasks chain.
  Pass.
- **III. Contract & Error Consistency** — **Directly engaged.** The existing
  `TemplateClient.getTemplates` pagination shape (`cursor`/`next_cursor`)
  conflicts with `docs/api/openapi.yaml`'s documented `GET /templates`
  contract (`page`/`size` query params, `PageMeta { page, size,
  totalElements, totalPages, hasNext, hasPrevious }` in the response `meta`).
  Per the Constitution, the OpenAPI doc supersedes the pre-existing client
  shape — this plan corrects `templateClient.real.ts`/`.types.ts` to the
  documented contract rather than building pagination against a shape the
  real backend doesn't implement. Pass, once corrected (tracked in
  research.md and data-model.md).
- **IV. Security Non-Negotiables** — N/A. No auth/credential handling
  touched. Pass.
- **V. Verified Before Done** — Applies directly: `oxlint`, `tsc -b && vite
  build`, and `vitest` must all pass, and the new sort/pagination/filter
  interactions must be exercised in a running browser before this feature is
  reported done, per spec SC-001–SC-005.

No violations. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/007-catalog-pagination-and-filters/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── types/
│       └── api.ts                                   # PageInfo → PageMeta-aligned shape
└── features/
    └── home/
        ├── types.ts                                 # TemplateListItem.tags; drop unused CatalogPageData
        ├── api/
        │   ├── templateClient.types.ts               # getTemplates params/response contract
        │   ├── templateClient.real.ts                 # page/size params, {data, meta} response mapping
        │   └── templateClient.mock.ts                 # category/tags filtering, sort, official-first, paging, MOCK_TAGS
        ├── hooks/
        │   └── useCatalogFilters.ts                   # + category, tag, sort URL-synced state
        ├── components/
        │   ├── FilterBar.tsx                          # + Category select, Tag chips, sort control composition
        │   ├── TagFilterChips.tsx                      # generalize into a reusable chip-group (Category or Tag)
        │   └── TemplateGrid.tsx                        # + "load more" affordance
        └── pages/
            └── CatalogPage.tsx                        # wire sort/pagination/category/tag end-to-end
```

**Structure Decision**: Single Vite/React SPA, existing feature-first layout
(`src/features/home`). Every file above already exists except the new
`contracts/` doc for this feature; no new routes or top-level directories are
introduced.

## Complexity Tracking

> No Constitution Check violations — this section is intentionally empty.
