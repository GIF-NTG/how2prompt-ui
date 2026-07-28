# Implementation Plan: Align Current UI With Approved Design Mockup

**Branch**: `006-align-ui-with-design-mockup` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-align-ui-with-design-mockup/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Restyle the already-implemented Catalog page, Template Detail page, and shared
TopBar so their colors, typography, and spacing match
`docs/design/how2prompt-workspace-mockup.html` exactly — a presentation-only
change with no new data, no new routes, and no behavior change. The technical
approach is a token-by-token visual audit (documented in `research.md`) of every
in-scope component against the mockup's `:root` design tokens, followed by
targeted Tailwind class edits per component; no new styling infrastructure
(CSS variables, theme layer) is introduced, matching the repo's existing
inline-arbitrary-value convention.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19

**Primary Dependencies**: Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`, no
`tailwind.config` theme layer — styling is inline Tailwind arbitrary values, per
existing convention in `src/features/auth` and `src/shared/components/TopBar.tsx`),
React Router 7

**Storage**: N/A — no data model changes; this feature only edits presentation

**Testing**: Vitest + Testing Library for the existing component/unit test suite
(regression check only — no new test scenarios are needed for a pure restyle,
see FR-007); manual/Playwright-driven visual comparison against the design
reference for the acceptance scenarios in spec.md

**Target Platform**: Web browser (the existing SPA), light and dark theme via
`prefers-color-scheme` (no in-app theme toggle exists yet, matching current
behavior)

**Project Type**: Web frontend (single Vite/React SPA) — no backend involved

**Performance Goals**: No new performance targets; must not regress existing
bundle size or render performance (style-only edits, no new dependencies)

**Constraints**: Every touched element's color must resolve to one of the design
reference's token values (see `research.md` token table) in both themes; no
functional/behavioral change permitted (FR-007); History and Auth screens are
out of scope (FR-008)

**Scale/Scope**: 3 screens / ~11 components:
- Catalog: `CatalogPage.tsx`, `SearchBox`, `FilterBar`, `TemplateRail`,
  `TemplateGrid`, `TemplateCard`
- Template Detail: `TemplateDetailPage.tsx`, `TemplateHero`, `ModelTags`,
  `UsageGuide`, `ExampleOutput`, `TemplateMeta`, `BackLink`, `NotFoundState`
- Shared shell: `TopBar.tsx`

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dynamic Form Rendering Integrity** — N/A. This feature touches no
  template-generation form; it does not add, remove, or restyle any
  `template_variables`-driven control. Pass.
- **II. Spec-Before-Code** — Satisfied by this spec → plan → tasks chain itself
  (`specs/006-align-ui-with-design-mockup/spec.md` already approved before this
  plan). Pass.
- **III. Contract & Error Consistency** — N/A. No API/contract surface is
  touched; `templateClient`/`templateDetailClient`/`authClient` and their error
  handling are unchanged (FR-007). Pass.
- **IV. Security Non-Negotiables** — N/A. No auth/credential/secret handling is
  touched. Pass.
- **V. Verified Before Done** — Applies directly: `oxlint`, `tsc -b && vite
  build`, and `vitest` must all pass, and the restyled screens must be exercised
  in a running browser (light + dark) before this feature is reported done, per
  spec SC-001–SC-004.
- **Development Workflow guidance** ("reuse already-approved visual tokens
  ... rather than introducing a new palette per page") — this is the entire
  point of the feature; the plan's approach (token audit + inline Tailwind
  values matching the mockup's `:root` tokens, no new palette) directly follows
  it.

No violations. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-align-ui-with-design-mockup/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

`data-model.md` and `contracts/` are intentionally omitted: this feature
introduces no new entities, fields, or external interfaces (see "Data Model"
note in `research.md`) — it only edits the styling of existing components.

### Source Code (repository root)

```text
src/
├── shared/
│   └── components/
│       └── TopBar.tsx                          # shared nav shell — restyle
├── features/
│   ├── home/
│   │   ├── pages/
│   │   │   └── CatalogPage.tsx                  # restyle (layout wiring only)
│   │   └── components/
│   │       ├── SearchBox.tsx                    # restyle
│   │       ├── FilterBar.tsx                    # restyle
│   │       ├── TemplateRail.tsx                 # restyle
│   │       ├── TemplateGrid.tsx                 # restyle
│   │       └── TemplateCard.tsx                 # restyle (badge/chip/fav-btn)
│   └── template-detail/
│       └── components/
│           ├── TemplateDetailPage.tsx           # restyle (layout wiring only)
│           ├── TemplateHero.tsx                 # restyle
│           ├── ModelTags.tsx                    # restyle
│           ├── UsageGuide.tsx                   # restyle
│           ├── ExampleOutput.tsx                # restyle
│           ├── TemplateMeta.tsx                 # restyle
│           ├── BackLink.tsx                     # restyle
│           └── NotFoundState.tsx                # restyle

docs/design/
└── how2prompt-workspace-mockup.html             # reference only — not modified
```

**Structure Decision**: Single Vite/React SPA (existing `how2prompt-ui`
feature-first layout under `src/features/<feature>`, shared code under
`src/shared`). This feature is scoped entirely to existing files listed above —
no new directories, routes, or files are created.

## Complexity Tracking

> No Constitution Check violations — this section is intentionally empty.
