# Implementation Plan: Translate App Text to English

**Branch**: `012-translate-app-to-english` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-translate-app-to-english/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Replace all remaining hardcoded Vietnamese UI strings (labels, headings, buttons,
placeholders, `aria-label`s, badges, empty/loading states, and validation/error/
success messages) across the app with English equivalents, including local mock API
client data that is displayed directly in the UI, and update the automated tests
that assert on the old Vietnamese text — with no behavior, layout, or logic change.

## Technical Context

**Language/Version**: TypeScript (existing project config), React 19

**Primary Dependencies**: None added — reuses the existing stack (React Router 7,
Tailwind CSS v4, Vitest + Testing Library). This is a content-only change.

**Storage**: N/A — only local mock API client fixtures (`*.mock.ts`) are touched, not
any real persistence layer.

**Testing**: Vitest + Testing Library (existing), run via `npm run test`

**Target Platform**: Web (browser SPA)

**Project Type**: Single frontend project (existing `how2prompt-ui` structure)

**Performance Goals**: N/A — no runtime behavior changes

**Constraints**: Zero behavior/layout/logic change; `oxlint`, `tsc -b && vite build`,
and `vitest` must all pass (Constitution Principle V); no Vietnamese text may remain
in any `src/` UI-facing string per spec SC-001

**Scale/Scope**: ~96 files across `src/features/{home,template-detail,
template-generate,auth,history,admin}` and `src/shared`, including components,
pages, mock API clients, and their test files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Applies? | Assessment |
| --- | --- | --- |
| I. Dynamic Form Rendering Integrity | No | This feature only replaces string literals; it does not touch how `template_variables` are read or rendered, and does not extend the legacy pill/canvas pattern to new screens. |
| II. Spec-Before-Code | Yes | This plan follows an approved `spec.md` (`/speckit.specify` already run); implementation will proceed via `/speckit.tasks` → `/speckit.implement`. |
| III. Contract & Error Consistency | No | No API contract, request/response shape, or error-envelope field is touched — only the human-readable message text inside existing error/success UI states. |
| IV. Security Non-Negotiables | No | No auth, password, or credential handling is touched. |
| V. Verified Before Done | Yes | `oxlint`, `tsc -b && vite build`, and `vitest` must all pass, and changed screens must be exercised in a running browser, before any task is reported complete. |

**Result**: PASS — no violations, no complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/012-translate-app-to-english/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output — N/A, no new data entities
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature exposes no new external interface (no API,
CLI, or wire-format change) — it is a UI copy-only change, so the contracts phase is
skipped per the plan workflow's own guidance.

### Source Code (repository root)

```text
src/
├── app/                            # shell/routing (App.test.tsx, PageFallback.tsx)
├── shared/
│   ├── components/                 # TopBar.tsx, ThemeToggle.tsx
│   └── utils/                      # httpClient.ts
└── features/
    ├── home/                       # catalog, search, filters, template cards
    ├── template-detail/            # template detail page + banners
    ├── template-generate/          # dynamic generate form, preview, actions
    ├── auth/                       # login/register/forgot/reset/verify/profile
    ├── history/                    # history + favorites
    └── admin/                      # AI models, taxonomy, templates, dashboard
        ├── components/
        ├── pages/
        ├── context/
        └── api/*.mock.ts
```

Each `features/<name>/{components,pages}/*.tsx` file and its co-located `*.test.tsx`
is edited in place — no new files or directories are introduced; `*.mock.ts` files
under each feature's `api/` folder are edited for any UI-visible mock content.

**Structure Decision**: Existing feature-first single frontend project structure is
reused as-is (per `CLAUDE.md`); this feature only edits string literals inside
already-existing files across the six feature areas and `src/shared`.

## Complexity Tracking

_No violations — this section is not applicable._
