# Phase 0 Research: Prompt Generation Engine

No `[NEEDS CLARIFICATION]` markers remain in the spec. This phase resolves
the three "must agree before splitting" items the team flagged, plus one
critical pre-existing defect surfaced while grounding the plan in the actual
wire contract.

## ⚠️ Critical finding: existing FE types don't match the real API's field casing

**Finding**: `docs/api/openapi.yaml`'s schemas use `camelCase` throughout
(`promptBody`, `isOfficial`, `usageCount`, `createdAt`, ...) — confirmed
directly in `TemplateListItem`/`TemplateDetail`/`TemplateVersion` (lines
1143–1196). CLAUDE.md's own "API & error conventions" section states this
explicitly: "All JSON fields are `camelCase`". But the already-shipped FE
types (`src/features/home/types.ts`, `src/features/template-detail/types.ts`)
declare `snake_case` fields (`prompt_body`, `is_official`, `usage_count`,
`created_at`, `cover_image`, `favorite_count`, `view_count`) — and
`httpClient.ts`'s `apiFetch` performs **no field-name transformation**, only
unwrapping the outer `{ data, meta }` envelope (confirmed by reading its full
source). Both `templateClient.real.ts` and `templateDetailClient.real.ts`
call `apiFetch<TemplateListItem>(...)` / `apiFetch<TemplateDetail>(...)`
directly — a type assertion with no runtime mapping.

**Impact if unaddressed**: against the real backend (`VITE_API_BASE_URL`
set), every field read via these snake_case property names would be
`undefined` at runtime — the catalog and template detail pages would render
blank/undefined everywhere, despite passing `tsc` (TypeScript trusts the
type assertion, not the actual shape). This is invisible in mock mode, which
is why it wasn't caught by any of this repo's existing tests or manual
browser checks so far (all done against the mock client).

**Decision for this feature**: `template-generate`'s own new types
(`TemplateVariable`, `TemplateVariant`, `GenerateRequest`, `GenerateResponse`)
are defined in **camelCase**, matching `docs/api/openapi.yaml` exactly — this
plan does not copy the pre-existing mistake into new code. The extension to
`TemplateVersion` (adding `variables`/`variants`) also uses camelCase for
those two new fields specifically, even though the rest of that interface
remains snake_case for now.

**Explicitly out of scope for this feature**: retrofitting the already-
shipped `home` and `template-detail` types/clients to camelCase. That is a
larger, cross-cutting fix (affects the catalog, its tests, and the existing
detail page) unrelated to what Epic 3 needs to ship, and deserves its own
spec so it can be verified in isolation. **This must be flagged to the team
lead as an urgent, separately-tracked bug** — it is a real defect that will
break the real backend integration the moment it's pointed at, independent
of Epic 3.

**Alternatives considered**: silently matching the existing snake_case
convention for consistency — rejected, because it would make the new
`template-generate` code fail against the real backend in exactly the same
way, compounding the bug instead of at least containing it to code that
predates this plan.

## Decision: entry point — extend the existing detail route, not a new one

**Decision**: `TemplateDetailPage.tsx` (route `/templates/:slug`, unchanged)
mounts a new `<TemplateGenerateSection templateSlug={slug} />` below its
existing read-only content (hero, model tags, usage guide, example output,
meta). No new route is added.

**Rationale**: `docs/design/how2prompt-workspace-mockup.html`'s only
template-detail-shaped screen (`#pageTemplate`) already combines browsing a
template with generating from it in one page — model select, dynamic form,
preview panel, and output box all appear on the same screen as the
title/description, not behind a separate navigation step. Splitting it into
two routes would contradict the approved design and add a navigation step
the design never shows. `005-view-template-details`'s spec already
anticipated this: it scoped itself to read-only and explicitly named
"generate prompt action (Epic 3)" as the deferred piece — the natural reading
is "this same page grows that capability," not "a new page appears."

**Alternatives considered**: a separate `/templates/:slug/generate` route —
rejected as contradicting the mockup and adding an unnecessary click between
"decide to use a template" and "start filling it in."

## Decision: shared state shape (the Developer A / Developer B contract)

**Decision**: One hook, `useGenerateForm(template: TemplateDetail)`, owned by
the Foundational phase and consumed identically by both developers' halves:

```ts
interface GenerateFormState {
  selectedModelCode: string
  inputValues: Record<string, string | number | boolean | string[]>
  extraInstructions: string
  errors: Record<string, string> // varKey -> validation message, empty = valid
  isValid: boolean // every required field passes validation
}
```

Developer A's `DynamicForm`/`FormField`/`ModelVariantSelect` read
`inputValues`/`selectedModelCode`/`errors` and call the hook's setters.
Developer B's `PreviewPanel`/`GenerateActions` read the same `inputValues`/
`extraInstructions`/`selectedModelCode`/`isValid` — neither side needs to
know how the other renders, only this shared shape.

**Rationale**: This is the single point of coupling between the two
developers' work; fixing it in the Foundational phase (before either side
starts) is what makes true file-disjoint parallel implementation possible,
per the team's own request. It directly maps `useCatalogFilters.ts`'s
already-proven pattern in this codebase (one hook, multiple consuming
components) rather than introducing a new state-management approach.

**Alternatives considered**: Context API for cross-component state —
rejected as unnecessary; the hook lives in one container component
(`TemplateGenerateSection.tsx`) and passes state down as props, matching
every other feature in this repo (no Context usage exists in `home` or
`template-detail` either).

## Decision: guest fingerprint

**Decision**: `guestFingerprint.ts` generates a random UUID once and persists
it in `localStorage` under a single key, read back on every subsequent visit
— reused as the `X-Guest-Fingerprint` header value on every generate call
made without a session.

**Rationale**: `docs/api/openapi.yaml` requires this header from
unauthenticated requests (line 613+) but does not prescribe how the FE
derives it — a stable per-browser random ID is the standard, simplest
approach and needs no new dependency (matches the existing
`localStorage`-based session bootstrapping already used in
`src/features/auth`).

**Alternatives considered**: a browser-fingerprinting library (canvas/audio
fingerprinting) — rejected as disproportionate and privacy-invasive for a
"limit free usage" mechanism; a random persisted ID achieves the same
practical goal (rate-limit evasion via clearing storage is an accepted
trade-off already implicit in the contract's design).

## Data model

See `data-model.md` for the full shape of `TemplateVariable`,
`TemplateVariant`, `GenerateRequest`/`GenerateResponse`, and the
`GenerateFormState` shared-state contract above.

## External interfaces / contracts

See `contracts/generate-endpoint.md` for the `POST /templates/{id}/generate`
request/response/error contract this feature's `generateClient` implements
(already documented in `docs/api/openapi.yaml` — this file is a
feature-scoped summary, not a new contract).
