# Research: Prompt History & Favorites

## Decision: New feature module `src/features/history`

**Decision**: Add a new feature-first module `src/features/history/` with
`api/` (mock/real/types split), `hooks/`, `components/`, `pages/`, `types.ts`
— mirroring `src/features/home` and `src/features/template-detail`.

**Rationale**: History and favorites are their own domain (generated-prompt
records, not templates or auth), and the project's established convention
(see `home`, `template-detail`, `template-generate`) is one feature folder
per domain with a `<name>Client.ts` env-based switch between
`<name>Client.mock.ts` and `<name>Client.real.ts`, both implementing a
`<name>Client.types.ts` interface. `HistoryPage` (`/history`) and
`FavoritesPage` (`/favorites`) both live under this module since they read
the same `historyClient`.

**Alternatives considered**: Folding history into `home` (rejected — `home`
is catalog/discovery, a different bounded concern per `CLAUDE.md`'s Epic
list) or into `template-detail` (rejected — history is not template-scoped,
it's user-scoped).

## Decision: No new dependencies (no React Query, no Zustand)

**Decision**: Implement data fetching with the same
`useState`/`useEffect`/`useCallback` + request-generation-counter pattern
already used in `CatalogPage.tsx` and `useTemplateDetail.ts`. Filters use
`useSearchParams` (see `useCatalogFilters.ts`), not a new store.

**Rationale**: `package.json` has no `@tanstack/react-query` or `zustand` —
the source user stories (`us-4.2`, `us-4.4`) mention them as one team's
technical-implementation notes, but they are not this project's actual
stack. `CLAUDE.md`/global conventions: reuse existing patterns, don't add a
dependency unless necessary. The existing manual-fetch pattern already
solves race conditions (a `requestGeneration` ref) and is proven across
three features.

**Alternatives considered**: Introducing React Query as the source stories
suggest — rejected, would be an unrequested new dependency and inconsistent
with every other data-fetching hook in the codebase.

## Decision: Pagination uses `page`/`size`, not cursor

**Decision**: `GET /generated-prompts` and `GET /favorites` are paged with
`page`/`size` query params and a `PageMeta` response (`{ page, size,
totalElements, totalPages, hasNext, hasPrevious }`), identical to the
catalog's pagination.

**Rationale**: `docs/api/openapi.yaml` (the checked-in, authoritative wire
contract per Constitution Principle III) defines both endpoints with
`page`/`size` params returning `{ data, meta: PageMeta }` — not a cursor.
The source user story (`us-4.2`) mentions cursor-based pagination, but the
OpenAPI spec supersedes it when they disagree.

**Alternatives considered**: Implementing a cursor abstraction to match the
story doc — rejected, would not match the real backend contract and adds
complexity with no payoff.

## Decision: Filters via URL search params, reusing the `useCatalogFilters` shape

**Decision**: `HistoryPage` gets its own `useHistoryFilters` hook (template,
model, date-from, date-to) built the same way as `useCatalogFilters` —
`useSearchParams` with typed getters/setters, `{ replace: true }` updates.

**Rationale**: Keeps filtered history views deep-linkable/bookmarkable and
matches the one existing precedent for list-filtering UI in this codebase
exactly. Introducing a different filter mechanism here (e.g. local
component state) would be an unjustified deviation.

**Alternatives considered**: Local `useState` for filters — rejected, loses
shareability and breaks convention for no benefit.

## Decision: "Re-run" passes the history entry id via a `reload` query param

**Decision**: The "Re-run" action navigates to `/templates/:templateId?reload=<generatedPromptId>`
(the route param name in `App.tsx` is `:slug` today, but the value passed
into it is whatever id `templateDetailClient.getDetail` is given — the
history record only provides `templateId`, not a slug, since
`GeneratedPromptListItem`/`Detail` in `docs/api/openapi.yaml` don't include
one; see data-model.md).
`TemplateDetailPage` (or `TemplateGenerateSection`) checks for a `reload`
param on mount and, if present, calls `GET /generated-prompts/{id}` to fetch
the full record (`inputValues`, `aiModelCode`, `extraInstructions`) and
seeds the generate form with it.

**Rationale**: `us-4.3`'s own technical notes says `GET
/generated-prompts/{id}` "returns full `input_values` (JSONB) for form
pre-population" — the backend already supports fetching by id, so passing
just the id keeps the URL small, shareable, and survives a page refresh
(unlike React Router `location.state`, which is lost on reload/direct
navigation — the same reasoning `ProfileSettingsPage` already documents for
why it waits on `isRestoring` rather than trusting transient state).
`useGenerateForm` needs one addition: an optional `initialOverride` (model
code + input values) it applies instead of template defaults when present —
a small, additive change to an existing hook, not a rewrite.

**Alternatives considered**: Passing the full history record via
`navigate(path, { state })` — rejected, doesn't survive a refresh/direct
link and the id-based `GET` approach is already implied by the backend
contract. Duplicating a `/history/:id/reload` route — rejected, unnecessary
since the target of "reload" is always the template's own existing detail
route.

## Decision: Fix `toggleFavorite` to actually toggle (POST vs DELETE)

**Decision**: `templateClient.toggleFavorite` and
`templateDetailClient.toggleFavorite` currently always send `POST
/templates/{id}/favorite` regardless of current state — there is no code
path that calls `DELETE`. This epic extends both real clients' `toggleFavorite`
to accept the current `isFavorited` flag and call `POST` (add) or `DELETE`
(remove) accordingly, still returning `{ isFavorited }`. Call sites
(`TemplateMeta.tsx`, `TemplateCard.tsx`) pass their current state in.

**Rationale**: FR-012 (toggle must both favorite and unfavorite) and FR-013
(unfavoriting from the `/favorites` list must work) are unimplementable
without this fix — the feature description says the favorite/unfavorite
_capability_ already exists and should be reused, not reimplemented from
scratch, but "reuse" here means fixing an incomplete existing
implementation to match its own documented contract (`docs/api/openapi.yaml`
already defines both the `POST` and `DELETE` endpoints), not introducing a
new mechanism.

**Alternatives considered**: Leaving `toggleFavorite` as POST-only and
adding a separate `unfavorite` method only used by the new
`/favorites` page — rejected, would leave the existing heart-icon toggle
bug in place (clicking twice would double-POST instead of removing),
which directly contradicts FR-012's acceptance scenario 2.

## Decision: Route guarding follows the existing self-guarding page pattern

**Decision**: `HistoryPage` and `FavoritesPage` guard themselves exactly
like `ProfileSettingsPage`: read `{ session, isRestoring }` from `useAuth()`,
render nothing/a loading state while `isRestoring`, then `<Navigate to="/login" replace />`
if `!session` once restoration has settled.

**Rationale**: This is the only auth-gating pattern in the codebase (no
`<ProtectedRoute>` wrapper exists) and it correctly avoids a false redirect
during the async session-restore race that `ProfileSettingsPage`'s own
comments call out.

**Alternatives considered**: A new `ProtectedRoute` wrapper component —
rejected as an unrequested abstraction; would only be justified if a third
protected page appears and the duplicated guard becomes a real maintenance
burden.
