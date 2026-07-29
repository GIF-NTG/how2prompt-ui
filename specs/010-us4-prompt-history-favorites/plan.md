# Implementation Plan: Prompt History & Favorites

**Branch**: `010-us4-prompt-history-favorites` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-us4-prompt-history-favorites/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a `/history` page (list, filter by template/model/date, paginate,
delete single/bulk, reload-into-generate-form "Re-run") and a `/favorites`
page for logged-in Users, per Epic 4 (`us-4.1`–`us-4.5`). The backend
already auto-saves history on every `POST /templates/{id}/generate` and
already exposes `GET/DELETE /generated-prompts`, `GET /generated-prompts/{id}`,
and the favorite endpoints (`docs/api/openapi.yaml`) — this is a
frontend-only feature that consumes those contracts using the project's
existing feature-module pattern (mock/real client split, `useSearchParams`
filters, self-guarding pages), plus one small fix to make the existing
`toggleFavorite` client actually toggle (POST when adding, DELETE when
removing) instead of always POSTing.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: React Router 7 (`useSearchParams`, `useNavigate`),
existing `httpClient.ts`/`apiFetch` wrapper — no new dependencies (see
research.md)

**Storage**: N/A on the frontend — backend Postgres tables
(`generated_prompts`, `favorites`) already exist and are out of scope; this
feature only calls the already-live REST endpoints

**Testing**: Vitest + Testing Library (jsdom), mirroring existing
`*.test.tsx`/`*.mock.test.ts` patterns in `home`/`template-generate`

**Target Platform**: Web (Vite SPA), same as rest of the project

**Project Type**: Web frontend (single Vite/React app, no separate backend
in this repo)

**Performance Goals**: History list interactions (filter, paginate) feel
instant against the mock client; favorite toggle is optimistic (<500ms
perceived, per SC-004) — same bar as existing catalog filtering/favoriting

**Constraints**: Must not introduce new runtime dependencies (React
Query/Zustand mentioned in the source user stories are not in this
project's stack — see research.md); must not change the existing Epic 3
generate/backend-render flow beyond seeding initial form values

**Scale/Scope**: 2 new routes (`/history`, `/favorites`), 1 new feature
module (`src/features/history`), 1 small fix to 2 existing files
(`templateClient.real.ts`, `templateDetailClient.real.ts`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dynamic Form Rendering Integrity** — N/A to this feature's own new
  screens (history list, favorites list are not template-input forms), but
  the "Re-run" pre-fill path feeds into the *existing* dynamic form
  (`useGenerateForm`/`DynamicForm`) without altering how it renders
  per-`template_variables` controls — it only adds an optional initial-value
  override. PASS.
- **II. Spec-Before-Code** — this plan follows an approved spec.md sourced
  from `how2prompt-agentic/docs/user-stories/us-4.1`–`us-4.5.md` and
  `agent/BA.md` §2. PASS.
- **III. Contract & Error Consistency** — all new client calls go through
  `apiFetch`/`httpClient.ts` (existing envelope/error/auth handling
  untouched); endpoints and field names sourced directly from
  `docs/api/openapi.yaml` (contracts/history-favorites.md). PASS.
- **IV. Security Non-Negotiables** — no new auth/credential handling
  introduced; all history/favorites endpoints require the existing Bearer
  token flow. PASS.
- **V. Verified Before Done** — `npm run lint`, `tsc -b && vite build`, and
  `npm run test` must pass, and quickstart.md's browser scenarios must be
  exercised, before this feature is reported complete. Tracked for the
  implement phase, not violated by the plan itself.

No violations. Complexity Tracking table not needed.

## Project Structure

### Documentation (this feature)

```text
specs/010-us4-prompt-history-favorites/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── history-favorites.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── App.tsx                              # add /history, /favorites routes
├── features/
│   ├── history/                             # NEW feature module
│   │   ├── api/
│   │   │   ├── historyClient.ts             # env-based mock/real switch (same pattern as templateClient.ts)
│   │   │   ├── historyClient.mock.ts
│   │   │   ├── historyClient.real.ts
│   │   │   └── historyClient.types.ts
│   │   ├── hooks/
│   │   │   └── useHistoryFilters.ts         # useSearchParams, same shape as useCatalogFilters
│   │   ├── components/
│   │   │   ├── HistoryList.tsx
│   │   │   ├── HistoryFilterBar.tsx
│   │   │   ├── HistoryEmptyState.tsx
│   │   │   ├── DeleteConfirmDialog.tsx
│   │   │   └── FavoriteTemplateGrid.tsx     # reuses TemplateCard from home
│   │   ├── pages/
│   │   │   ├── HistoryPage.tsx
│   │   │   └── FavoritesPage.tsx
│   │   └── types.ts
│   ├── template-generate/
│   │   └── hooks/useGenerateForm.ts         # MODIFIED: accept optional initial override (model + inputValues)
│   ├── template-detail/
│   │   ├── api/templateDetailClient.real.ts # MODIFIED: toggleFavorite POST/DELETE fix
│   │   └── components/TemplateDetailPage.tsx # MODIFIED: read ?reload=<id>, fetch + pass override
│   └── home/
│       └── api/templateClient.real.ts       # MODIFIED: same toggleFavorite fix (shared bug)
└── shared/
    └── types/api.ts                          # unchanged, reused (I18nString, PageMeta, ApiError)
```

**Structure Decision**: Single Vite/React SPA (no separate backend in this
repo). New work is one self-contained feature module,
`src/features/history/`, following the exact mock/real client + hooks +
components + pages layout already used by `home` and `template-detail`.
Three existing files get small, additive edits (not rewrites): the route
table, the generate-form hook (optional pre-fill override), and the two
`toggleFavorite` real-client implementations (POST/DELETE fix).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
