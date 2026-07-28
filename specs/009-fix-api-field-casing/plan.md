# Implementation Plan: Fix API field casing mismatch (snake_case vs camelCase)

**Branch**: `009-fix-api-field-casing` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-fix-api-field-casing/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

The `home` and `template-detail` features declare their template/catalog types in
snake_case (`prompt_body`, `is_official`, `usage_count`, `created_at`, `cover_image`,
`favorite_count`, `view_count`, etc.), but `docs/api/openapi.yaml` — the authoritative
wire contract — specifies every JSON field in camelCase, and `httpClient.ts`'s
`apiFetch` does no field-name transformation. Against a real backend, every field read
through the old snake_case name silently resolves to `undefined`. The fix is a
mechanical rename: update the types, both real clients, both mock clients (keeping
their current fixture values/behavior), and every consuming component/test to the
exact camelCase names in the OpenAPI schema, with no other behavior change. See
`data-model.md` for the authoritative field mapping and `research.md` for two
substantive (non-casing) mismatches found and deliberately deferred.

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (React 19, Vite 8)

**Primary Dependencies**: React 19, React Router 7, Tailwind CSS v4 — none added; this
change touches only existing types/clients/components.

**Storage**: N/A (frontend-only; no local persistence involved in this change)

**Testing**: Vitest + Testing Library (jsdom) — `npm run test`; existing suites
`templateClient.mock.test.ts` and `CatalogPage.test.tsx` cover the affected surface
and must be updated to camelCase field names.

**Target Platform**: Browser SPA (Vite build)

**Project Type**: Web frontend (single project, feature-first `src/features/<feature>`)

**Performance Goals**: N/A — pure rename, no performance-sensitive path touched.

**Constraints**: Zero behavior change (FR-006); no new abstraction/transform layer in
`httpClient.ts` (per spec Assumptions).

**Scale/Scope**: 13 files across `src/features/home` and `src/features/template-detail`
(2 type files, 4 client files, 2 client-interface files, 5 components, 2 test files —
see Project Structure below for the exact list).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dynamic Form Rendering Integrity** — N/A. This change touches catalog/detail
  display fields only; no `template_variables`-driven form rendering is involved.
  PASS (not applicable).
- **II. Spec-Before-Code** — This plan follows an approved spec
  (`specs/009-fix-api-field-casing/spec.md`) produced via `/speckit-specify`, per the
  spec → plan → tasks → implement chain. PASS.
- **III. Contract & Error Consistency** — This change's entire purpose is to bring the
  frontend types back into alignment with `docs/api/openapi.yaml`, the principle's
  designated source of truth. It does not touch the error envelope or auth/token
  handling. PASS — this change directly serves this principle rather than risking it.
- **IV. Security Non-Negotiables** — N/A. No auth, password, or secret handling
  touched. PASS (not applicable).
- **V. Verified Before Done** — Plan requires `oxlint`, `tsc -b && vite build`, and
  `vitest` to pass, plus a manual browser walkthrough of the catalog and detail pages
  (see `quickstart.md`), before this is reported complete. PASS (planned, to be
  executed during implementation).

No violations — no entry needed in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/009-fix-api-field-casing/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory — this change does not define or expose a new interface; it
realigns the frontend with the endpoints already documented in
`docs/api/openapi.yaml` (repo root). `data-model.md` carries the field mapping instead.

### Source Code (repository root)

```text
src/features/home/
├── types.ts                          # TemplateListItem, AuthorBrief, Category, Tag, AiModel — rename fields
├── api/
│   ├── templateClient.types.ts       # TemplateClient interface — toggleFavorite return type
│   ├── templateClient.real.ts        # real fetch client — reads/returns renamed fields
│   ├── templateClient.mock.ts        # mock fixtures + filtering logic — rename fields, keep behavior
│   └── templateClient.mock.test.ts   # update assertions to camelCase
├── components/
│   ├── TemplateCard.tsx              # reads coverImage/isOfficial/usageCount/favoriteCount/createdAt/author.*
│   ├── TagFilterChips.tsx            # reads Tag.usageCount
│   └── CategoryFilterChips.tsx       # reads Category.* renamed fields (verify during implementation)
└── pages/
    ├── CatalogPage.tsx               # reads TemplateListItem fields for rendering/sorting
    └── CatalogPage.test.tsx          # update fixtures/assertions to camelCase

src/features/template-detail/
├── types.ts                          # TemplateDetail, TemplateVersion — rename fields
├── api/
│   ├── templateDetailClient.types.ts # TemplateDetailClient interface — toggleFavorite return type
│   ├── templateDetailClient.real.ts  # real fetch client — reads/returns renamed fields
│   └── templateDetailClient.mock.ts  # mock fixture — rename fields, keep values/behavior
└── components/
    ├── TemplateHero.tsx              # reads coverImage/isOfficial/title/description (verify during implementation)
    ├── TemplateMeta.tsx              # reads usageCount/favoriteCount/viewCount/createdAt/author.*
    ├── ModelTags.tsx                 # reads supportedModels (verify during implementation)
    └── TemplateDetailPage.tsx        # reads currentVersion.guide / currentVersion.exampleOutput
```

**Structure Decision**: Single project, existing feature-first layout
(`src/features/<feature>/{types.ts,api,components,pages}`) — no new files, no new
directories. Every path above already exists; this change edits field names in place.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — this section is not applicable.
