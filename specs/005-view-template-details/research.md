# Research: View Template Details

**Feature**: `specs/005-view-template-details`
**Date**: 2026-07-27

**Scope**: Read-only template detail page. No dynamic form, no prompt generation (Epic 3 out of scope).

## R1: How to resolve template by slug instead of ID

**Decision**: The frontend uses `GET /api/v1/templates/{slug}` to fetch template
detail. The backend resolves the slug to the internal template ID. The favorite
endpoint uses the template's internal ID, which is returned in the detail response.

**Rationale**: The spec constraint explicitly states route `/templates/:slug`.
Slug-based URLs are more SEO-friendly and human-readable than UUID-based URLs.
The backend can efficiently resolve slugs via a unique index on the `slug` column.

**Alternatives considered**:

- Using `GET /api/v1/templates/{id}` with client-side slug-to-ID lookup: rejected
  (requires an extra API call or maintaining a slug→ID map).
- Using hash-based routing: rejected (not human-readable, poor SEO).

## R2: How to structure the template detail client (mock vs. real)

**Decision**: Follow the existing pattern — a `TemplateDetailClient` interface in
`templateDetailClient.types.ts`, a factory in `templateDetailClient.ts` that
picks mock or real based on `VITE_API_BASE_URL`, and separate mock/real
implementations. The real client reuses `apiFetch` from `shared/utils/httpClient`.

**Rationale**: This is the established convention (see `features/auth/api/authClient.ts`
and `features/home/api/templateClient.ts`). It allows the detail page to be fully
functional with mock data before the backend is ready. The detail client is separate
from the catalog client because the API shape is different (detail returns full
template info, not list items).

**Alternatives considered**:

- Extending the existing `TemplateClient` with a `getDetail` method: rejected
  (the response shapes are fundamentally different; mixing them violates interface
  segregation).
- Using MSW for API mocking: rejected (the project uses the mock/real client
  pattern, not MSW).

## R3: How to handle view_count increment as background side-effect

**Decision**: Fire a `POST /api/v1/templates/{slug}/view` (or equivalent endpoint)
request on page load using `fetch` in a `useEffect` with an empty dependency array.
The request is fire-and-forget: no loading state, no error handling, no UI update.

**Rationale**: The view count is analytics-only — it must not block rendering or
show any visible indicator. `useEffect` with an empty dependency array fires the
request once on mount. The request is silently ignored if it fails.

**Alternatives considered**:

- Including view_count increment in the GET response (server-side on read):
  rejected (coupling analytics to read latency; the spec defines it as a separate
  background action).
- Using `navigator.sendBeacon`: considered but not needed — a simple fetch is
  sufficient for a non-critical analytics call.

## R4: How to render model tag pills

**Decision**: Create a `ModelTags` component that receives `supported_models:
string[]` and renders each as a small pill/tag. Each model code is mapped to a
display name (e.g., "gpt-4o" → "GPT-4o") using a static mapping. The pills are
styled per the mockup's `.model-tag` class.

**Rationale**: The mockup shows model tags as small rounded pills below the page
head. This is a purely presentational component with no state or side effects.
The static display name mapping avoids an extra API call for AI model data (which
is only needed for the filter dropdown on the catalog page, not here).

**Alternatives considered**:

- Fetching AI model names from `GET /api/v1/ai-models`: rejected (adds a network
  call for data that can be statically mapped; the catalog already fetches models
  for the filter dropdown).
- Using the `AiModel` type from the home feature: rejected (the detail page only
  needs the display name, not the full model object).

## R5: How to render the two-column vs. stacked layout

**Decision**: Use a single-column stacked layout for the read-only detail page.
The page head (hero), model tags, guide, example output, and metadata are stacked
vertically. On wider viewports (>= 860px), the guide and example output can be
placed side-by-side if desired, but the primary layout is vertical.

**Rationale**: The read-only detail page does not need the two-column form+preview
layout (that was for the dynamic form in Epic 3, which is out of scope). A clean
stacked layout is simpler, more mobile-friendly, and matches the information
hierarchy of the content.

**Alternatives considered**:

- Two-column layout for guide + example: considered but rejected — the content
  sections have different heights and the stacked layout reads more naturally.

## R6: How to implement the favorite toggle on the detail page

**Decision**: Create a `TemplateMeta` component that displays the usage count and
a favorite toggle button (heart icon). The toggle fires a
`POST /api/v1/templates/{id}/favorite` or `DELETE /api/v1/templates/{id}/favorite`
request and updates local state. The toggle is hidden for guests.

**Rationale**: The favorite toggle is identical in behavior to the one on template
cards (see `TemplateCard.tsx`). Reusing the same API pattern ensures consistency.
The detail page needs the template's internal `id` (not slug) for the favorite
endpoint, which is available in the detail response.

**Alternatives considered**:

- Creating a shared `FavoriteButton` component: good idea for future extraction,
  but the current scope is limited to two locations (card + detail); the
  duplication is acceptable for now.
