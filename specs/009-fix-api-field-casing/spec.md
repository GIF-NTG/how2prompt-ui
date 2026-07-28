# Feature Specification: Fix API field casing mismatch (snake_case vs camelCase)

**Feature Branch**: `fix-api-field-casing`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "Sửa lỗi field casing giữa FE và API thật: docs/api/openapi.yaml quy định toàn bộ JSON field là camelCase (promptBody, isOfficial, usageCount, createdAt, coverImage, favoriteCount, viewCount...) nhưng type hiện tại ở src/features/home/types.ts và src/features/template-detail/types.ts lại khai báo snake_case (prompt_body, is_official, usage_count, created_at, cover_image, favorite_count, view_count...). httpClient.ts's apiFetch không hề transform field name, chỉ unwrap envelope {data, meta}. Khi trỏ vào backend thật (VITE_API_BASE_URL), mọi field đọc qua các tên snake_case này sẽ là undefined vì key thật là camelCase. Cần sửa lại toàn bộ type + real client (templateClient.real.ts, templateDetailClient.real.ts) + mock client (giữ hành vi hiện tại nhưng field name đúng camelCase) + mọi component đang dùng field snake_case (TemplateCard, TemplateHero, TemplateMeta, CatalogPage, v.v.) sang đúng camelCase khớp openapi.yaml, không đổi hành vi UI/logic nào khác."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Catalog and template detail data renders correctly against the real backend (Priority: P1)

A user (Guest or registered) browses the template catalog and opens a template's detail
page while the app is connected to the real backend (`VITE_API_BASE_URL` set). Every
piece of template data the UI displays — cover image, official badge, usage/favorite/
view counts, creation date, author name, prompt body, category/tag names, and so on —
must show the actual value returned by the API, not a blank/undefined placeholder.

**Why this priority**: This is the core defect. Today, every field read through a
snake_case key silently resolves to `undefined` against the real API (which returns
camelCase), so cards and detail pages render blank counts, missing dates, and broken
images the moment the app is pointed at a real backend instead of the mock. This
blocks any real integration and is invisible in current tests because the mock client
happens to also use snake_case internally.

**Independent Test**: Point the app at a real (or realistically-shaped fixture)
backend response using the exact field names from `docs/api/openapi.yaml`, load the
catalog page and a template detail page, and verify every data-bound field (badges,
counts, dates, images, author, prompt body) renders the expected value instead of
being blank/undefined.

**Acceptance Scenarios**:

1. **Given** the catalog page loads a list of templates from the API, **When** the
   response uses camelCase keys (`isOfficial`, `usageCount`, `favoriteCount`,
   `coverImage`, `createdAt`, `isFavorited`, `supportedModels`, etc.) as specified in
   `docs/api/openapi.yaml`, **Then** each template card displays the correct official
   badge state, usage count, favorite count, cover image, and creation date.
2. **Given** a template detail page loads a single template from the API, **When**
   the response uses camelCase keys (`promptBody`, `viewCount`, `exampleOutput`,
   `currentVersion`, etc.), **Then** the hero section and meta panel display the
   correct prompt body, view count, and version info.
3. **Given** the app is running against the existing mock client (no real backend
   configured), **When** a user browses the catalog or a template detail page,
   **Then** the UI behaves exactly as it does today — same data, same visual result,
   same filtering/sorting/pagination behavior — with no regression.

---

### User Story 2 - Consistent field naming across the codebase for future API work (Priority: P2)

A developer wiring up a new screen or fixing a future bug reads
`src/features/home/types.ts` or `src/features/template-detail/types.ts` and can trust
that the field names in those types are the actual wire field names from
`docs/api/openapi.yaml`, without needing to cross-reference the spec or discover the
mismatch by debugging a blank UI.

**Why this priority**: Secondary to the user-facing defect, but this is what prevents
the same class of bug from recurring — the type is the contract developers actually
read day-to-day.

**Independent Test**: Compare every field name in the affected type files, client
files, and consuming components against `docs/api/openapi.yaml`'s schemas for the
templates/catalog/detail endpoints and confirm an exact, case-sensitive match with no
leftover snake_case field.

**Acceptance Scenarios**:

1. **Given** a type in `src/features/home/types.ts` or
   `src/features/template-detail/types.ts` models data returned by an endpoint
   documented in `docs/api/openapi.yaml`, **When** the field names are compared
   side-by-side with the OpenAPI schema, **Then** every field name matches exactly
   (camelCase, same spelling).
2. **Given** a component reads a field off one of these types (e.g. `TemplateCard`,
   `TemplateHero`, `TemplateMeta`, `CatalogPage`), **When** the field is renamed to
   camelCase, **Then** the component is updated to the new name and continues to
   render the same value it did before the change.

---

### Edge Cases

- Nested objects (e.g. `author`, `categories[]`, `tags[]`, `currentVersion`) must also
  have every nested field renamed to camelCase (e.g. `author.fullName`,
  `author.avatarUrl`, `category.parentId`, `category.sortOrder`,
  `category.templateCount`, `tag.usageCount`, `currentVersion.promptBody`,
  `currentVersion.exampleOutput`) — a partial rename that fixes only top-level fields
  still leaves nested data blank against the real API.
- Fields that are `null`-able (e.g. `coverImage`, `avatarUrl`, `parentId`,
  `iconUrl`/`icon`, `color`) must keep the same nullability after renaming.
- The mock client's internal fixture/response data must be renamed to camelCase too
  (not just the type), so mock and real clients share one consistent shape and the UI
  code has exactly one field name to read regardless of which client is active.
- Existing tests that assert on snake_case field names (e.g.
  `templateClient.mock.test.ts`, `CatalogPage.test.tsx`) must be updated to the new
  camelCase names so they keep validating real behavior rather than being deleted or
  left failing.
- No other behavior (filtering, sorting, pagination, favoriting, search debounce,
  guest quota, etc.) should change as a side effect of the rename.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Every field in `src/features/home/types.ts` and
  `src/features/template-detail/types.ts` that corresponds to a field documented in
  `docs/api/openapi.yaml` MUST be renamed from snake_case to the exact camelCase name
  used in the OpenAPI schema (e.g. `prompt_body` → `promptBody`, `is_official` →
  `isOfficial`, `usage_count` → `usageCount`, `created_at` → `createdAt`,
  `cover_image` → `coverImage`, `favorite_count` → `favoriteCount`, `view_count` →
  `viewCount`, and all other affected fields including nested objects).
- **FR-002**: `src/features/home/api/templateClient.real.ts` and
  `src/features/template-detail/api/templateDetailClient.real.ts` MUST read/return
  data using the renamed camelCase field names, with no field-name transformation
  layer introduced — the client passes through the API response as-is, matching the
  updated types.
- **FR-003**: The mock clients (`templateClient.mock.ts`,
  `templateDetailClient.mock.ts`) MUST be updated to produce data using the same
  camelCase field names, while preserving their current fixture data values and
  behavior (filtering, sorting, pagination, favoriting, etc.) exactly as-is.
- **FR-004**: Every component currently reading a snake_case field from these types
  (including but not limited to `TemplateCard`, `TemplateHero`, `TemplateMeta`,
  `CatalogPage`) MUST be updated to read the renamed camelCase field, with no change
  to what is rendered or how it behaves.
- **FR-005**: Existing tests referencing the old snake_case field names MUST be
  updated to the new camelCase names so the test suite continues to pass and continues
  to validate real behavior.
- **FR-006**: The rename MUST NOT change any UI behavior, business logic, visual
  output, or data values — it is a pure field-naming correction to align with the
  documented API contract.

### Key Entities

- **TemplateListItem** (`src/features/home/types.ts`): catalog list item shown on
  `TemplateCard` — fields include cover image, official flag, author, categories,
  tags, supported models, usage/favorite counts, favorited flag, created date.
- **TemplateDetail** (`src/features/template-detail/types.ts`): full detail record
  shown on the template detail page — includes everything in `TemplateListItem` plus
  view count and the current version (prompt body, guide, example output).
- **AuthorBrief**, **Category**, **Tag**, **AiModel**, **TemplateVersion**: nested/
  related entities embedded in the above, each with their own snake_case fields that
  need the same camelCase correction.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: When the app is configured against a backend response shaped exactly
  per `docs/api/openapi.yaml`, 100% of template fields shown in the catalog and detail
  views (badges, counts, dates, images, prompt body, author, categories, tags) render
  the actual value instead of appearing blank/undefined.
- **SC-002**: Zero snake_case field names matching the affected data model remain in
  `src/features/home` and `src/features/template-detail` (types, clients, components,
  tests) after the change, verified by direct comparison against the OpenAPI schema.
- **SC-003**: The full existing test suite for the `home` and `template-detail`
  features passes after the rename, with no test behavior changes beyond the field
  name update.
- **SC-004**: Manual walkthrough of the catalog page and a template detail page under
  the mock client shows identical visual output and behavior to before the change.

## Assumptions

- `docs/api/openapi.yaml` is authoritative for field naming, per the project's
  `CLAUDE.md`; any field referenced by current code but absent from the OpenAPI spec
  is out of scope for this fix (left as-is) unless it's a nested field of an in-scope
  entity.
- This fix is scoped to the `home` (catalog) and `template-detail` features only, as
  named in the request — other features (auth, history, admin) are not touched even
  if they have similar issues, since they weren't reported as in scope.
- `httpClient.ts`'s `apiFetch` continues to only unwrap the `{data, meta}` envelope
  and does not gain a field-casing transformation layer — the fix is at the type/
  client/component level, not a runtime transform, consistent with keeping this a
  pure contract-alignment fix with no new abstraction.
- No backend or API contract change is required — `docs/api/openapi.yaml` already
  specifies camelCase; only the frontend is out of sync.
