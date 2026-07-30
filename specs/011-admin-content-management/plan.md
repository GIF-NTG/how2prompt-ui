# Implementation Plan: Admin & Content Management

**Branch**: `011-admin-content-management` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-admin-content-management/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add four Admin-only screens (AI models, taxonomy, template authoring/publish,
analytics dashboard) gated behind a new route-level Admin guard, following this
repo's existing feature-first structure and mock/real client-split convention. The
frontend's `Session` gains an `isAdmin` flag (currently only exposed on the backend's
fuller `UserProfile` schema, not surfaced anywhere in the frontend yet) to drive
routing and nav visibility. Per Constitution Principle III, `docs/api/openapi.yaml`
supersedes the BA/user-story detail where they disagree — research surfaced that the
contract does not yet expose AI-model/category deletion, any admin tag endpoints, or
a signup→first-generate conversion metric; this plan scopes those out as named,
tracked gaps (`research.md` Decision 3) rather than building against endpoints that
don't exist.

## Technical Context

**Language/Version**: TypeScript 5.x on React 19, per the existing repo (`package.json`).

**Primary Dependencies**: React Router 7 (new protected routes), Tailwind CSS v4
(existing design tokens — no new palette), no new runtime dependency required — chart
rendering for the dashboard (FR-015) can start with simple data tables/bars using
existing Tailwind utilities; a charting library is an implementation-detail decision
deferred to `/speckit-tasks` if the plain-CSS approach proves insufficient.

**Storage**: N/A — this repo is the frontend SPA only; all persistence is via the
existing `Backend` REST API (`docs/api/openapi.yaml`), consumed through `apiFetch`.

**Testing**: Vitest + Testing Library (jsdom), matching every existing feature
(`*.test.tsx` colocated with components/pages).

**Target Platform**: Browser SPA (existing Vite build), no new platform surface.

**Project Type**: Web frontend (single project — this repo does not own the backend).

**Performance Goals**: No new goals beyond the repo-wide targets already documented in
CLAUDE.md (`agent/BA.md` §4.4) — admin screens are internal/low-traffic and don't need
bespoke performance work beyond avoiding obviously wasteful re-renders.

**Constraints**: Must integrate only against endpoints `docs/api/openapi.yaml`
documents (Constitution Principle III) — see `research.md` Decision 3 for the three
resulting scope reductions (no model/category delete, no tag admin UI, no conversion
funnel).

**Scale/Scope**: 4 new pages, 1 new route guard, 4 new API client trios (mock+real),
1 `Session`/`AuthProvider` extension, 1 `TopBar` nav addition.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dynamic Form Rendering Integrity** — N/A to admin screens themselves (they are
  authoring UIs, not the Epic 3 template-_usage_ form), **except** that the template
  authoring screen's variable-declaration UI produces the same `template_variables`
  JSONB shape Epic 3 already consumes — this plan's `data-model.md` Template Variable
  section reuses that exact schema rather than inventing a parallel one. PASS.
- **II. Spec-Before-Code** — This plan follows an approved `spec.md` sourced from
  `us-5.1`–`us-5.4` and `agent/BA.md` §2, per the mandated spec → plan → tasks →
  implement chain. PASS.
- **III. Contract & Error Consistency** — Every admin client integrates only against
  documented `docs/api/openapi.yaml` endpoints (`contracts/admin-api.md`); gaps are
  named and scoped out rather than guessed at (`research.md` Decision 3). Error
  handling reuses the existing `ApiError`/envelope pattern. PASS.
- **IV. Security Non-Negotiables** — No new credential handling introduced; admin
  auth reuses the existing `Authorization: Bearer` + silent-refresh session model.
  PASS.
- **V. Verified Before Done** — `quickstart.md` requires `oxlint`, `tsc -b && vite
build`, `vitest`, and a manual browser walkthrough of all four stories before this
  feature is reported complete. PASS.

No violations requiring justification — Complexity Tracking section left empty.

## Project Structure

### Documentation (this feature)

```text
specs/011-admin-content-management/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── admin-api.md     # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── App.tsx                          # Add /admin/* routes, wrapped in RequireAdmin
├── features/
│   ├── auth/
│   │   ├── api/types.ts                 # Session gains `isAdmin: boolean`
│   │   ├── api/authClient.mock.ts       # Second seeded admin fixture account
│   │   └── api/authClient.real.ts       # BackendUser gains isAdmin, passed into toSession
│   └── admin/                           # New feature
│       ├── components/
│       │   └── RequireAdmin.tsx         # Route guard (research.md Decision 2)
│       ├── pages/
│       │   ├── AiModelsPage.tsx         # User Story 1
│       │   ├── TaxonomyPage.tsx         # User Story 2 (categories; tags read-only note)
│       │   ├── TemplatesAdminPage.tsx   # User Story 3 (list + author/publish)
│       │   └── DashboardPage.tsx        # User Story 4
│       └── api/
│           ├── aiModelsClient.{ts,mock.ts,real.ts,types.ts}
│           ├── taxonomyClient.{ts,mock.ts,real.ts,types.ts}
│           ├── templatesAdminClient.{ts,mock.ts,real.ts,types.ts}
│           └── dashboardClient.{ts,mock.ts,real.ts,types.ts}
└── shared/
    └── components/TopBar.tsx            # Conditional "Admin" nav entry when session.isAdmin

tests/ (colocated *.test.tsx per existing convention, not a separate tree)
```

**Structure Decision**: Single frontend project (this repo doesn't own the backend).
New `src/features/admin/` feature folder follows the same feature-first layout and
mock/real client-split convention as every existing feature (`auth`, `home`,
`template-detail`, `template-generate`) — one client trio per admin resource per
`research.md` Decision 4, one page per user story, and a single shared `RequireAdmin`
guard rather than duplicating the access check across four pages.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — table intentionally omitted.
