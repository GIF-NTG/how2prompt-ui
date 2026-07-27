# Implementation Plan: Home — Template Catalog (Browse, Filter, Search)

**Branch**: `004-home-catalog-browse` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-home-catalog-browse/spec.md`

## Summary

Build the Home/Catalog page (Epic 2) so visitors can browse, filter, and search the
template library. The page renders three sections — Featured rail, Trending rail, and
full template grid — with a filter bar (search input, AI model dropdown, tag chips)
that composes with AND logic and reflects active filters in the URL query string for
deep-linking. The design must match `docs/design/how2prompt-workspace-mockup.html`
exactly: standard boxed form controls, not the inline fill-in-the-blank auth pattern.
Data comes from `GET /api/v1/templates`, `/templates/featured`, `/templates/trending`,
`/ai-models`, `/categories`, and `/tags` — all Guest-accessible, no auth required.

## Technical Context

**Language/Version**: TypeScript 6.0, React 19

**Primary Dependencies**: React Router 7, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest 4 + Testing Library (jsdom)

**Storage**: N/A (frontend-only; data fetched from REST API)

**Testing**: Vitest 4 + @testing-library/react + jsdom + @testing-library/user-event

**Target Platform**: Modern browsers (SPA), Vite 8 dev/build

**Project Type**: Web application (frontend SPA)

**Performance Goals**: Catalog loads within 2s under normal network; search results appear within 1s of debounce

**Constraints**: All API endpoints are Guest-accessible (no auth required for browsing); cursor-based pagination; search and filters compose with AND logic

**Scale/Scope**: 1 Home page, ~8 new components, 1 API client module, 1 hook, ~5 shared types

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic Form Rendering Integrity | ✅ PASS | This feature is Epic 2 (catalog/browse), not Epic 3 (template generation). The catalog page uses standard boxed form controls (search, dropdown, chips), NOT the inline fill-in-the-blank pattern. The spec explicitly states FR-019: "standard boxed form controls — NOT the inline fill-in-the-blank pattern." No conflict. |
| II. Spec-Before-Code | ✅ PASS | Spec exists at `specs/004-home-catalog-browse/spec.md`. This plan follows the spec → plan → tasks chain. |
| III. Contract & Error Consistency | ✅ PASS | All endpoints use `/api/v1/...` namespace. Error responses follow `{ error: { code, message, details?, trace_id? } }`. The catalog endpoints are Guest-accessible (no auth token required). |
| IV. Security Non-Negotiables | ✅ PASS | No passwords or credentials involved. No sensitive data in catalog responses. |
| V. Verified Before Done | ✅ PASS | Will run `oxlint`, `tsc -b && vite build`, and `vitest` before reporting complete. |

**Post-Phase 1 Re-check**: Will re-evaluate after data model and contracts are defined.

## Project Structure

### Documentation (this feature)

```text
specs/004-home-catalog-browse/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── template-api.md  # API contract for template browsing
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.tsx                              # Add /explore route
│   └── layout/
│       └── RootLayout.tsx                   # Upgrade to full top bar (brand, nav, user chip)
│
├── features/
│   ├── auth/                                # Existing (unchanged)
│   └── home/
│       ├── api/
│       │   ├── templateClient.types.ts      # TemplateClient interface
│       │   ├── templateClient.ts            # Factory: mock or real
│       │   ├── templateClient.mock.ts       # In-memory mock data
│       │   └── templateClient.real.ts       # Real HTTP (fetch via shared httpClient)
│       ├── components/
│       │   ├── TemplateCard.tsx             # Single template card
│       │   ├── TemplateCard.test.tsx
│       │   ├── TemplateGrid.tsx             # Responsive grid of cards
│       │   ├── TemplateRail.tsx             # Horizontal scroll rail
│       │   ├── FilterBar.tsx                # Search + model dropdown + tag chips
│       │   ├── FilterBar.test.tsx
│       │   ├── SearchBox.tsx                # Search input with magnifier icon
│       │   ├── ModelFilter.tsx              # AI model dropdown
│       │   ├── TagFilterChips.tsx           # Tag toggle chips
│       │   └── EmptyState.tsx               # Zero-results message
│       ├── hooks/
│       │   ├── useCatalogFilters.ts         # Filter/search state + URL sync
│       │   └── useCatalogFilters.test.ts
│       ├── pages/
│       │   ├── CatalogPage.tsx              # Main catalog page (replaces HomePage stub)
│       │   └── CatalogPage.test.tsx
│       └── types.ts                         # Template, Tag, AiModel, CatalogFilters
│
├── shared/
│   ├── components/
│   │   └── TopBar.tsx                       # App shell top bar (brand, nav, user chip)
│   ├── hooks/
│   │   └── useDebounce.ts                   # Generic debounce hook (300ms)
│   ├── types/
│   │   └── api.ts                           # I18nString, PageInfo, ApiError types
│   └── utils/
│       └── httpClient.ts                    # Moved from features/auth/api/ to shared/
│
└── test/
    └── setup.ts                             # Existing (unchanged)
```

**Structure Decision**: Feature-first under `src/features/home/` following the existing
convention established by `src/features/auth/`. The `httpClient.ts` is promoted from
`features/auth/api/` to `shared/utils/` so the new template client can reuse it without
circular imports. The `TopBar` component is shared across all app views (not home-specific)
so it lives in `shared/components/`.

## Complexity Tracking

> No constitution violations — no complexity tracking needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
