# Implementation Plan: View Template Details

**Branch**: `005-view-template-details` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-view-template-details/spec.md`

## Summary

Build the read-only template detail page (route: `/templates/:slug`) so visitors can
view a template's full information — description, usage guide, example output,
supported AI models, and usage count. The page loads template data from
`GET /api/v1/templates/{slug}` and displays it in a clean, stacked layout. The
design must match `docs/design/how2prompt-workspace-mockup.html`. The page
increments `view_count` as a background side-effect on load. **This feature is
strictly read-only — no dynamic form, no live preview, no prompt generation
(Epic 3 is out of scope).**

## Technical Context

**Language/Version**: TypeScript 6.0, React 19

**Primary Dependencies**: React Router 7, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest 4 + Testing Library (jsdom)

**Storage**: N/A (frontend-only; data fetched from REST API)

**Testing**: Vitest 4 + @testing-library/react + jsdom + @testing-library/user-event

**Target Platform**: Modern browsers (SPA), Vite 8 dev/build

**Project Type**: Web application (frontend SPA)

**Performance Goals**: Detail page loads within 2s under normal network conditions

**Constraints**: Template resolved by slug (not ID); view_count increment is fire-and-forget; responsive layout; dark mode required; read-only (no form interaction)

**Scale/Scope**: 1 new page, ~7 new components, 1 new API client module, 1 new hook, ~3 new types, 1 new route

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

No `.specify/memory/constitution.md` exists. The project's governing principles are
documented in `CLAUDE.md` and `how2prompt-agentic/CLAUDE.md`. Key constraints applied:

| Principle                           | Status  | Notes                                                                                                                                                            |
| ----------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Dynamic Form Rendering Integrity | ✅ PASS | This feature is strictly read-only (Epic 2). No dynamic form rendering, no inline fill-in-the-blank pattern. The page only displays static information sections. |
| II. Spec-Before-Code                | ✅ PASS | Spec exists at `specs/005-view-template-details/spec.md`. This plan follows spec → plan → tasks chain.                                                           |
| III. Contract & Error Consistency   | ✅ PASS | All endpoints use `/api/v1/...` namespace. Error responses follow `{ error: { code, message, details?, trace_id? } }`. The detail endpoint is Guest-accessible.  |
| IV. Security Non-Negotiables        | ✅ PASS | No passwords or credentials involved. Favorite toggle only for authenticated users.                                                                              |
| V. Verified Before Done             | ✅ PASS | Will run `oxlint`, `tsc -b && vite build`, and `vitest` before reporting complete.                                                                               |

**Post-Phase 1 Re-check**: Will re-evaluate after data model and contracts are defined.

## Project Structure

### Documentation (this feature)

```text
specs/005-view-template-details/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── template-detail-api.md  # API contract for template detail
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.tsx                              # Add /templates/:slug route
│   └── layout/
│       └── RootLayout.tsx                   # Existing (unchanged)
│
├── features/
│   ├── auth/                                # Existing (unchanged)
│   ├── home/                                # Existing (unchanged — catalog page)
│   └── template-detail/                     # NEW FEATURE
│       ├── api/
│       │   ├── templateDetailClient.types.ts  # TemplateDetailClient interface
│       │   ├── templateDetailClient.ts        # Factory: mock or real
│       │   ├── templateDetailClient.mock.ts   # In-memory mock data for detail
│       │   └── templateDetailClient.real.ts   # Real HTTP (fetch via shared httpClient)
│       ├── components/
│       │   ├── TemplateDetailPage.tsx          # Main detail page (route component)
│       │   ├── BackLink.tsx                    # "← Quay lại thư viện" navigation
│       │   ├── TemplateHero.tsx                # Page head: eyebrow, title, description
│       │   ├── ModelTags.tsx                   # AI model tag pills
│       │   ├── UsageGuide.tsx                  # Usage guide section
│       │   ├── ExampleOutput.tsx               # Example output section
│       │   ├── TemplateMeta.tsx                # Usage count + favorite toggle
│       │   └── NotFoundState.tsx               # 404 error state
│       ├── hooks/
│       │   └── useTemplateDetail.ts            # Fetch template detail by slug
│       └── types.ts                           # TemplateDetail, TemplateVersion, TemplateVariant
│
├── shared/
│   ├── components/
│   │   └── TopBar.tsx                       # Existing (unchanged)
│   ├── hooks/
│   │   └── useDebounce.ts                   # Existing (unchanged)
│   ├── types/
│   │   └── api.ts                           # Existing (I18nString, PageInfo, ApiError)
│   └── utils/
│       ├── httpClient.ts                    # Existing (apiFetch, ApiError)
│       └── i18n.ts                          # getI18nValue utility (if not already shared)
│
└── test/
    └── setup.ts                             # Existing (unchanged)
```

**Structure Decision**: Feature-first under `src/features/template-detail/` following
the convention established by `src/features/home/` and `src/features/auth/`. The
detail page is a self-contained feature with its own API client, components, hooks,
and types. It imports shared types (`I18nString`, `ApiError`) and utilities
(`httpClient`, `getI18nValue`) from `src/shared/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| (none)    | —          | —                                    |
