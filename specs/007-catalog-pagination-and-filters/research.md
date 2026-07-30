# Phase 0 Research: Complete Catalog Browsing

No `[NEEDS CLARIFICATION]` markers remain in the spec, so this phase audits
the actual code (`src/features/home`) and the actual wire contract
(`docs/api/openapi.yaml`) to ground every FR in a concrete, verified decision.

## Decision: fix the pagination contract shape before building on it

**Finding**: `templateClient.types.ts`'s `getTemplates` declares
`cursor?: string` → `{ data, page_info: { next_cursor, has_next }, total_count }`,
and `PageInfo` (`src/shared/types/api.ts`) mirrors that cursor shape. But
`docs/api/openapi.yaml`'s `GET /templates` (lines 499–544) documents:

- Request: `page` (integer, default 0) and `size` (integer, default 20, max 50) — **not** `cursor`/`limit`.
- Response: `{ data: TemplateListItem[], meta: PageMeta }` where `PageMeta`
  (lines 959–968) is `{ page, size, totalElements, totalPages, hasNext,
hasPrevious }` — Spring Data's offset-based `Page`, not a cursor.

Additionally, `httpClient.ts`'s `apiFetch` already unwraps the envelope's
`data` field and returns only that (`return (data as ApiEnvelope<T>).data`),
discarding `meta` entirely — so `templateClient.real.ts`'s current
`apiFetch<TemplatesResponse>(...)` call, which expects the _raw_ endpoint
body to already be `{ data, page_info, total_count }`, would in practice
receive just the bare `TemplateListItem[]` array and mis-type it. This is a
second, related defect: `getTemplates` needs its own two-step fetch (or a
`meta`-preserving variant of `apiFetch`) to get both the array and the
pagination metadata.

**Decision**: Realign to the documented contract:

- `getTemplates` params: replace `cursor?: string` with `page?: number`, keep
  `limit` but rename semantics to `size` to match the contract (or keep the
  param named `limit` on the FE side for readability and map it to `size` in
  the querystring — chosen: keep the FE-facing param name `page`/`size`
  directly, since `templateClient.types.ts` is an internal interface with no
  external consumers to preserve compatibility for).
- `getTemplates` response: `{ data: TemplateListItem[], meta: PageMeta }`.
- `PageInfo` (renamed usage to `PageMeta` where it represents this shape) is
  redefined to `{ page: number; size: number; totalElements: number;
totalPages: number; hasNext: boolean; hasPrevious: boolean }`.
- `templateClient.real.ts` MUST read the raw response body itself (bypassing
  `apiFetch`'s auto-unwrap, or fetching via `apiFetch<{ data, meta }>` on an
  endpoint where the envelope's `data` field genuinely _is_ `{ data, meta
}`) — concretely: since `apiFetch` already strips the outer
  `ApiResponse<T>` envelope, `getTemplates` should call
  `apiFetch<{ data: TemplateListItem[]; meta: PageMeta }>(...)`, i.e. treat
  the endpoint's inner body (post-outer-unwrap) as `{ data, meta }` per the
  OpenAPI schema shown above — this matches `apiFetch`'s existing contract
  (it always unwraps exactly one `data` envelope) and openapi.yaml's
  response schema in one pass; no `apiFetch` change is needed.
- `MOCK` client's `getTemplates` mirrors the corrected shape: slices
  `MOCK_TEMPLATES` by `page`/`size` and returns a `PageMeta`-shaped `meta`.

**Rationale**: Constitution Principle III: `docs/api/openapi.yaml` supersedes
any conflicting shape elsewhere, including this repo's own pre-existing
client code. Building "real" pagination against the fictional cursor shape
would produce a feature that works only in mock mode and breaks the moment
`VITE_API_BASE_URL` is set — directly contradicting FR-001/FR-002's intent
that pagination actually reaches every template.

**Alternatives considered**: Leave the cursor shape and treat this as a
pre-existing, separately-tracked bug — rejected, because FR-001/FR-002
cannot be honestly verified as "done" against a contract the plan already
knows is wrong; fixing it is a strict prerequisite, not scope creep.

## Decision: "load more" pattern, not infinite scroll

**Decision**: `TemplateGrid` renders a "Xem thêm" (load more) button below
the grid when `meta.hasNext` is true; clicking it fetches `page + 1` with the
same active filters/sort and appends results, matching spec's Assumptions
section. `CatalogPage` keeps an accumulated `templates` array and the current
`page` in local state, reset to `page = 0` and an empty accumulator whenever
`q`, `model`, `category`, `tag`, or `sort` changes (satisfies User Story 2's
"changing it restarts pagination from the first page").

**Rationale**: No infinite-scroll exists anywhere else in this app; a
same-page "load more" click preserves scroll position and needs no
IntersectionObserver plumbing, keeping the change scoped to the pagination
requirement itself.

## Decision: sort control values and where sorting happens

**Decision**: Add a `sort` `<select>` in `FilterBar` (visually matching the
existing `.model-select` token styling) with two options mapped to the
existing `TemplateClient` sort enum: "Phổ biến nhất" → `popular`, "Mới nhất"
→ `newest`. `CatalogPage` passes the selected value straight through to
`getTemplates({ sort, ... })`; sorting itself happens server-side for the
real client (already contractually true per `sort` enum in openapi.yaml) and
client-side in the mock (`Array.prototype.sort` by `usage_count` desc for
`popular`, by `created_at` desc for `newest`) applied _before_ pagination
slicing.

**Rationale**: Reuses the exact enum already declared in
`TemplateClient.getTemplates`'s `sort` param (`'popular' | 'newest' |
'most_used' | 'official'`) — only `popular`/`newest` are exposed as UI
options per spec's two named choices; `most_used`/`official` remain valid
values in the type (used internally, e.g. `getFeatured`) but aren't
user-facing sort options per this spec.

## Decision: official-first ordering, applied after sort

**Decision**: In the mock client, after applying the selected sort
comparator, stable-partition the filtered array so every `is_official: true`
item precedes every non-official item, preserving each group's relative sort
order. For the real client, this ordering is the backend's responsibility
per BA.md US-2.1 ("templates with is_official=true are prioritized at the
top") — the FE issues no extra request/param for it, consistent with
`sort=popular` already being the contract's default and official-priority
being bundled into that server-side ordering per the BA acceptance
criterion.

**Rationale**: Matches spec's Assumption ("official templates are listed
first, then the remaining templates follow the chosen sort") without
inventing a new query parameter the documented contract doesn't have.

## Decision: Category and Tag as two independent filters

**Finding**: `TemplateClient.getTemplates` **already** declares `category?:
string` separately from `tags?: string` (`templateClient.types.ts`), and
`templateClient.real.ts` **already** forwards both independently to the
querystring. The bug is entirely in the Catalog feature's own wiring:

- `useCatalogFilters.ts` only tracks one `tag` field in its state/URL param.
- `TagFilterChips.tsx` calls `templateClient.getCategories()` (not
  `getTags()`) and writes the selected _category_ slug into that one `tag`
  state.
- `CatalogPage.tsx` sends that category-flavored value into
  `getTemplates({ tags: queryKey.tag })` — the wrong parameter for what it
  actually holds.
- `TemplateListItem` has no `tags` field at all (only `categories`), and the
  mock's `getTags()` returns `[]` — so even if wiring were fixed, there is no
  mock tag data to filter by yet.

**Decision**:

- `useCatalogFilters.ts` gains three independent URL-synced fields:
  `category` (`?category=`), `tag` (`?tag=`), and `sort` (`?sort=`), replacing
  the old single `tag` field's category-filtering role.
- `TagFilterChips.tsx` is generalized into a reusable chip-group component
  (same visual pattern, parameterized by `{ items, value, onChange, label }`)
  and instantiated twice in `FilterBar.tsx`: once fed by `getCategories()`
  driving the `category` state, once fed by `getTags()` driving the `tag`
  state.
- `TemplateListItem` gains a `tags: Tag[]` field (mirroring the existing
  `categories: Category[]` field); mock data gets a small `MOCK_TAGS` list
  and 1–2 tags per mock template so the new filter is demonstrable in dev
  mode.
- `CatalogPage.tsx` passes `category: queryKey.category, tags: queryKey.tag`
  — now each state maps to its own, already-correct API parameter.

**Rationale**: The wire contract for category/tag separation already exists
and is already correct in `templateClient.real.ts`; per the user's explicit
instruction this session ("tag và category là 2 cái khác nhau riêng biệt, cứ
theo tài liệu mà làm"), the fix is to make the Catalog feature's own state
and mock data honor the contract that already exists, not to invent a new
one.

**Alternatives considered**: Keep the single merged filter (the interim
scope decision recorded in `specs/004-home-catalog-browse/spec.md`) —
explicitly superseded by the user's direction this session to follow BA.md's
literal two-axis model instead.

## Data model

See `data-model.md` for the full before/after shape of `TemplateListItem`,
`PageInfo`/`PageMeta`, and the mock data additions.

## External interfaces / contracts

See `contracts/templates-list.md` for the corrected `GET /templates` request/
response shape this feature aligns the FE client to (already documented in
`docs/api/openapi.yaml` — this file is a feature-scoped pointer/summary, not
a new contract).
