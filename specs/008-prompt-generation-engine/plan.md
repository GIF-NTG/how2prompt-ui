# Implementation Plan: Prompt Generation Engine

**Branch**: `008-prompt-generation-engine` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-prompt-generation-engine/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add the "use this template" experience to the already-shipped, read-only
template detail page (`005-view-template-details`): a model selector, a
dynamic form rendered from the template's declared variables, a live
client-side preview, an optional free-form instructions field, and a
Generate & Copy action that calls the backend's authoritative render
endpoint. Built as a new `src/features/template-generate` feature consumed
from the existing `/templates/:slug` route, split into two independently
implementable halves (form-building vs. preview/generate) that share one
lifted state object defined in this plan's data model — enabling two
developers to implement in parallel after a small shared Foundational layer
is in place.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19

**Primary Dependencies**: React Router 7 (existing `/templates/:slug` route),
Vite 8, Tailwind CSS v4 (inline arbitrary values matching
`docs/design/how2prompt-workspace-mockup.html`'s `#pageTemplate` screen —
`.field-group`, `.field-row`, `.chip-select`, `.toggle`, `.slider-row`,
`.preview-panel`, `.output-box` token rules)

**Storage**: N/A in this repo — `generated_prompts` persistence is entirely
backend-owned; this feature only calls `POST /templates/{id}/generate`

**Testing**: Vitest + Testing Library, following this repo's existing
per-component/per-hook test convention (e.g. `templateClient.mock.test.ts`,
`CatalogPage.test.tsx`)

**Target Platform**: Web browser (existing SPA), mock-client dev mode by
default, real client path against the documented contract

**Project Type**: Web frontend (single Vite/React SPA), no backend work in
this repo — `POST /templates/{id}/generate` and its guest-quota mechanism are
already documented in `docs/api/openapi.yaml` as backend-owned

**Performance Goals**: Live preview (User Story 2) must re-render on every
keystroke with no network round trip and no perceptible delay (SC-003)

**Constraints**: The live preview is advisory only — the authoritative
result always comes from the backend's render (FR-006); client-side
validation must block Generate for any invalid/incomplete required field
(FR-002, FR-007); guest requests must carry `X-Guest-Fingerprint`

**Scale/Scope**: One route (`/templates/:slug`, extended, not new), ~14
files, organized so two developers can split the work file-disjointly
(see Project Structure and the parallel-work note below)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dynamic Form Rendering Integrity (NON-NEGOTIABLE)** — **This is the
  principle this feature exists to satisfy.** The form MUST render one
  control per `template_variables` entry by declared `input_type`
  (text/textarea/select/multiselect/number/boolean/slider), i18n
  label/placeholder/help text, and `validation`-driven client-side checks
  that gate the Generate action — exactly FR-001/FR-002. The pre-existing
  `InlineBlankForm` pill pattern (auth screens only) MUST NOT be reused here.
  Gate: gated by Phase 1 design (`data-model.md`, `contracts/`) confirming
  the field-type/validation mapping before task generation.
- **II. Spec-Before-Code** — Satisfied by this spec → plan → tasks chain.
  Pass.
- **III. Contract & Error Consistency** — **Directly engaged, with a
  pre-existing defect found during this plan's research.** See research.md's
  "camelCase contract mismatch" finding: the existing `TemplateDetail` /
  `TemplateListItem` FE types (home and template-detail features, shipped
  before this plan) declare `snake_case` fields (`prompt_body`,
  `is_official`, `usage_count`) while `docs/api/openapi.yaml` documents
  `camelCase` (`promptBody`, `isOfficial`, `usageCount`) with zero
  transformation layer in `httpClient.ts`. This plan's own new types
  (`TemplateVariable`, `TemplateVariant`, `GenerateRequest`/`GenerateResponse`)
  will be defined correctly in `camelCase` per the documented contract — this
  plan does not silently perpetuate the pre-existing mismatch into new code,
  but fixing the already-shipped home/template-detail types is explicitly
  out of scope here (see Assumptions in spec.md and research.md) and must be
  tracked as a separate, urgent fix.
- **IV. Security Non-Negotiables** — N/A directly, but FR-005's edge case
  (prompt-injection-shaped input in "additional instructions") is handled by
  treating it as literal text — no execution/interpretation on the FE side.
  Pass.
- **V. Verified Before Done** — Applies directly: `oxlint`, `tsc -b && vite
build`, and `vitest` must all pass, and the dynamic form's field types,
  validation, live preview, and generate/copy toast must be exercised in a
  running browser (per this Constitution's own rationale for this
  principle) before this feature is reported done.

No violations requiring justification. No entries required in Complexity
Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/008-prompt-generation-engine/
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
├── features/
│   ├── template-detail/
│   │   ├── types.ts                                     # TemplateVersion gains variables[]/variants[]
│   │   ├── api/templateDetailClient.{types,mock,real}.ts # getDetail response includes variables/variants
│   │   └── components/TemplateDetailPage.tsx             # mounts <TemplateGenerateSection> below existing read-only content
│   └── template-generate/                                 # NEW feature — this plan's scope
│       ├── types.ts                                       # TemplateVariable, TemplateVariant, GenerateRequest/Response, GuestQuotaError
│       ├── api/
│       │   ├── generateClient.types.ts
│       │   ├── generateClient.mock.ts
│       │   ├── generateClient.real.ts
│       │   └── generateClient.ts
│       ├── utils/
│       │   ├── renderTemplate.ts                          # client-side {{placeholder}} substitution (preview only)
│       │   └── guestFingerprint.ts                        # stable per-browser id, localStorage-persisted
│       ├── hooks/
│       │   └── useGenerateForm.ts                          # the ONE shared state hook (Foundational — see below)
│       └── components/
│           ├── TemplateGenerateSection.tsx                 # container; owns useGenerateForm, composes the two halves
│           ├── ModelVariantSelect.tsx                      # ── Developer A ──
│           ├── DynamicForm.tsx                              # ── Developer A ──
│           ├── FormField.tsx                                # ── Developer A ── (one control per input_type)
│           ├── ExtraInstructionsField.tsx                   # ── Developer A ──
│           ├── PreviewPanel.tsx                              # ── Developer B ──
│           ├── OutputBox.tsx                                 # ── Developer B ──
│           └── GenerateActions.tsx                           # ── Developer B ── (Generate + Copy buttons, error banner)
```

**Structure Decision**: New `src/features/template-generate` feature
(matches this repo's convention of one directory per capability — `home`,
`template-detail`, `auth` are already separate despite being related), kept
distinct from `template-detail` rather than folded into it, since
`005-view-template-details` deliberately shipped that feature as read-only
and this is additive, separately-owned work. `TemplateDetailPage.tsx` only
gains one new mount point (`<TemplateGenerateSection templateSlug={...} />`)
— it does not need to be torn apart or rewritten.

**Parallel-work split** (resolves the "route/entry point" and "shared state
shape" decisions the team flagged as needing consensus before splitting):

- **Foundational** (one person, or done together, ~1–2 hours): `types.ts`,
  `generateClient.*` skeleton, `useGenerateForm.ts`'s state shape (see
  data-model.md), `TemplateGenerateSection.tsx` skeleton wiring the mount
  point into `TemplateDetailPage.tsx`, and `template-detail`'s
  `variables`/`variants` plumbing. This MUST land on the shared feature
  branch and be pulled by both developers before their halves diverge.
- **Developer A** (User Story 1 + User Story 4): `ModelVariantSelect.tsx`,
  `DynamicForm.tsx`, `FormField.tsx`, `ExtraInstructionsField.tsx` — reads
  from `useGenerateForm`'s state and calls its setters; touches no file
  Developer B touches.
- **Developer B** (User Story 2 + User Story 3): `PreviewPanel.tsx`,
  `OutputBox.tsx`, `GenerateActions.tsx`, `renderTemplate.ts`,
  `generateClient.*`'s full implementation — reads the same
  `useGenerateForm` state, calls the render/generate functions; touches no
  file Developer A touches.
- Both branch off the Foundational commit into their own branch/worktree,
  implement independently, then merge back for a joint Polish pass (full
  form → preview → generate → copy flow exercised together).

## Complexity Tracking

> No Constitution Check violations requiring justification — this section is
> intentionally empty.
