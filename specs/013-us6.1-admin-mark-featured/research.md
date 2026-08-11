# Phase 0 Research: Admin Mark Template as Featured

## Decision 1: Wire field name for the Featured flag

**Decision**: Use `isFeatured` as the JSON field name both in the `PATCH
/admin/templates/{id}` request body and when reading it back from
`GET /templates/{id}` / `GET /admin/templates` responses, with a defensive
`?? false` default if the field is absent from a response.

**Rationale**: US-6.1's own "Technical Implementation Details" section (the most
authoritative source available — closer to backend intent than
`docs/api/openapi.yaml`, which this codebase's own admin client comments document
as stale on multiple other fields for this same endpoint) explicitly says: "Send
`isFeatured` boolean in the `PATCH /api/v1/admin/templates/{id}` payload" and
"`PATCH /api/v1/admin/templates/{id}` (existing endpoint) will accept an optional
`isFeatured` boolean field." No alternative name is suggested anywhere. Defaulting
to `false` when reading matches the existing pattern for other optional booleans on
this same raw shape (e.g. `isFavorited?: boolean` in
`RawTemplateListItem`, defaulted via `raw.isFavorited ?? false` in
`mapTemplateListItem`).

**Alternatives considered**:
- Wait for backend confirmation before writing any code — rejected: this project's
  established pattern (see `templatesAdminClient.real.ts` header comment,
  `project_templates_pagination_contract_drift`) is to build against the
  best-available documented contract and adjust the raw-shape mapping function in
  one place if the live backend turns out to differ, since that divergence has
  already happened repeatedly on this exact endpoint without blocking delivery.
- Introduce a separate dedicated endpoint (e.g. `POST /admin/templates/{id}/feature`)
  — rejected: US-6.1 explicitly reuses the existing `PATCH` endpoint, and no such
  dedicated endpoint exists in the live backend or `docs/api/openapi.yaml`.

## Decision 2: Where the Featured toggle lives in the admin UI

**Decision**: Add the toggle to `TemplateEditorForm.tsx` (the same modal used for
both create and edit), submitted through the existing `handleSaveDraft`/`update`
path — no separate "Publish"-style action is introduced for it.

**Rationale**: US-6.1's acceptance criteria describe "update a template and set it
to be Featured" / "update the template to remove the Featured status" — i.e. it's
a metadata field like title/description/categories, all of which are already
edited and saved together through this same form and the same
`patchMetadata`-backed `update()` call. Introducing a separate save action would
add an inconsistent second way to persist template metadata.

**Alternatives considered**:
- A dedicated "Feature" / "Unfeature" button directly in the list row (bypassing
  the edit form) — considered as a UX improvement per spec's SC-001 ("under 10
  seconds... without navigating through unrelated screens"), but deferred: adding
  it to the existing form already meets SC-001 in practice (the modal opens in one
  click) and keeps this feature's surface area minimal. Flagged as a nice-to-have
  for a future iteration, not blocking this feature.

## Decision 3: Read-side changes needed for FR-004 (homepage carousel)

**Decision**: None. `GET /templates/featured` and its consumption in
`HomeDataProvider.tsx` / `CatalogPage.tsx` already exist and already render
whatever templates the backend currently returns as featured — this feature only
needs to give the Admin a way to change what that backend state is.

**Rationale**: Confirmed by reading `templateClient.real.ts` (`getFeatured`) and
`HomeDataProvider.tsx` (`ensureFeatured`/`featured` state) — the full read path is
already implemented and wired into `CatalogPage.tsx`'s `FeaturedTemplateHero` and
Featured `TemplateGrid` section. FR-004 in the spec is satisfied by existing code,
not new code.

## Decision 4: Admin list Featured badge

**Decision**: Add a lightweight badge in the "Status" column area of
`TemplatesAdminPage.tsx`'s table, following the same conditional-className pattern
already used for the `published`/`draft` badge.

**Rationale**: Matches Story 3 / FR-005 with minimal new UI surface, reusing the
existing table structure rather than adding a new column that would require
touching the `<thead>` layout more invasively.

**Alternatives considered**: A separate "Featured" column — rejected as
unnecessarily wide for a single boolean; a badge next to the existing status badge
communicates the same information more compactly.
