# Implementation Plan: Admin Mark Template as Featured

**Branch**: `013-us6.1-admin-mark-featured` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-us6.1-admin-mark-featured/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add an Admin-only "Featured" toggle to the existing template management screen
(`src/features/admin/pages/TemplatesAdminPage.tsx` + `TemplateEditorForm.tsx`) so an
Admin can mark/unmark a template as Featured. The toggle is sent as `isFeatured` in
the existing `PATCH /admin/templates/{id}` call (`templatesAdminClient.update`) —
no new endpoint is introduced, matching US-6.1's own technical notes. The public
read side (`GET /templates/featured`, already consumed by the homepage's
`FeaturedTemplateHero` + carousel) needs no changes — it already reflects whatever
the backend currently has flagged. The admin template list gains a "Featured" badge
next to the existing status badge, satisfying User Story 3.

## Technical Context

**Language/Version**: TypeScript 5, React 19

**Primary Dependencies**: React Router 7, Vite 8, Tailwind CSS v4 — no new
dependency; reuses the existing `apiFetch` wrapper (`src/shared/utils/httpClient.ts`)

**Storage**: N/A (frontend only — persistence is the backend's `templates.featured_at`
column per US-6.1, out of scope for this repo)

**Testing**: Vitest + Testing Library (jsdom), following the existing pattern in
`TemplatesAdminPage.test.tsx` (mocked `templatesAdminClient`)

**Target Platform**: Web (SPA), admin-only routes gated by `RequireAdmin`

**Project Type**: Single frontend SPA (`src/features/admin`)

**Performance Goals**: N/A — a single boolean toggle on an existing form save path,
no new performance-sensitive surface

**Constraints**: Must reuse the existing `PATCH /admin/templates/{id}` call
(`patchMetadata` in `templatesAdminClient.real.ts`) rather than adding a new
endpoint — no such endpoint exists in the live backend and none is proposed by
US-6.1. Field name on the wire is assumed `isFeatured` (see research.md) since
that is the only name the source-of-truth user story specifies; every other field
on this endpoint already diverges from `docs/api/openapi.yaml`'s documented
`TemplateUpsert`/`TemplateListItem` shape (see `templatesAdminClient.real.ts`
header comment and `project_templates_pagination_contract_drift` history) — this
feature raises no new type of risk, it inherits an existing one.

**Scale/Scope**: One new form control, one new list-badge, changes confined to
`src/features/admin/{api,components,pages}` — no new files beyond tests.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dynamic Form Rendering Integrity** — N/A. This feature touches the admin
  template *authoring* form (a fixed set of admin-defined fields), not a
  template-generation form driven by `template_variables` JSONB. No conflict.
- **II. Spec-Before-Code** — Satisfied: this plan follows an approved
  `spec.md` sourced from `how2prompt-agentic/docs/user-stories/us-6.1-admin-mark-template-as-featured.md`
  (US-6.1), per the spec → plan → tasks → implement chain.
- **III. Contract & Error Consistency** — `docs/api/openapi.yaml` was already
  updated (prior session) to add `isFeatured` to `TemplateListItem` and
  `TemplateUpsert`, keeping the documented contract in sync with this feature.
  The real backend's actual field naming for `/admin/templates/{id}` already
  diverges from that document in ways unrelated to this feature (see Technical
  Context); this plan does not introduce a new divergence, it follows the one
  documented in `templatesAdminClient.real.ts`. Every error still flows through
  the shared `{ error: { code, message, details?, traceId? } }` envelope via
  `apiFetch` — no new error handling is introduced.
- **IV. Security Non-Negotiables** — No credentials/secrets touched. The toggle is
  gated behind the existing `RequireAdmin` route guard and the existing
  Bearer-token-authenticated `PATCH /admin/templates/{id}` call — no new auth
  surface.
- **V. Verified Before Done** — `oxlint`, `tsc -b && vite build`, and `vitest` must
  pass; the toggle must be exercised in a running browser (feature it on, confirm
  it persists on reload and shows in the admin list badge) before this feature is
  reported done.

**Result**: PASS — no violations, no Complexity Tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/013-us6.1-admin-mark-featured/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/features/admin/
├── api/
│   ├── templatesAdminClient.types.ts   # add `isFeatured` to TemplateUpsert + AdminTemplate
│   ├── templatesAdminClient.real.ts    # send/parse `isFeatured` through patchMetadata + mapAdminTemplate
│   └── templatesAdminClient.mock.ts    # mirror the same field for the mock client
├── components/
│   └── TemplateEditorForm.tsx          # add the "Featured" toggle control
├── pages/
│   ├── TemplatesAdminPage.tsx          # add the "Featured" badge in the list table
│   └── TemplatesAdminPage.test.tsx     # extend coverage for the new toggle/badge
docs/api/openapi.yaml                    # already updated (prior session) — no further change
```

**Structure Decision**: Single frontend SPA, feature-first layout already in place
(`src/features/admin`). This feature extends existing files in that structure; no
new directories are introduced. It follows the same "read/write shape diverges from
`docs/api/openapi.yaml`, mapped explicitly in `*.real.ts`" pattern already
established for every other admin-template field.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

_No violations — this section is intentionally empty._
