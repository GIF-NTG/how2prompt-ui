# Phase 1 Data Model: Complete Catalog Browsing

No new persistence or backend entities — this feature only changes
FE-internal TypeScript shapes so they match the already-documented backend
contract (`docs/api/openapi.yaml`), plus adds mock data for the new Tag
filter.

## `PageMeta` (replaces `PageInfo`) — `src/shared/types/api.ts`

**Before**:

```ts
export interface PageInfo {
  next_cursor: string | null
  has_next: boolean
}
```

**After**:

```ts
export interface PageMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
```

Matches `docs/api/openapi.yaml`'s `PageMeta` schema (lines 959–968)
verbatim, including its camelCase field names (per Constitution Principle
III — all JSON fields are camelCase, no `snake_case` translation layer).

`PageInfo` is renamed to `PageMeta` at its one call site
(`templateClient.types.ts`); no other file imports it (verified: only
`templateClient.real.ts`, `templateClient.types.ts`, and `home/types.ts`
reference `PageInfo` today).

## `TemplateListItem` — `src/features/home/types.ts`

**Added field**:

```ts
export interface TemplateListItem {
  // ...existing fields unchanged...
  tags: Tag[] // new — mirrors the existing `categories: Category[]` field
}
```

`Tag` already exists in this file (`{ id, slug, name, usage_count }`) and is
already exported by `TemplateClient.getTags()` — this only adds it to the
per-template shape returned by `getTemplates`/`getFeatured`/`getTrending`,
consistent with `docs/api/openapi.yaml`'s `TemplateListItem` schema
(templates already carry their tags in the list response, not just on the
detail page).

**Removed**: `CatalogPageData` (unused dead type — confirmed zero imports
anywhere in `src/`).

## `TemplateClient.getTemplates` — `src/features/home/api/templateClient.types.ts`

**Before**:

```ts
getTemplates(params: {
  q?: string
  category?: string
  tags?: string
  model?: string
  sort?: 'popular' | 'newest' | 'most_used' | 'official'
  limit?: number
  cursor?: string
}): Promise<{ data: TemplateListItem[]; page_info: PageInfo; total_count: number }>
```

**After**:

```ts
getTemplates(params: {
  q?: string
  category?: string
  tags?: string
  model?: string
  sort?: 'popular' | 'newest' | 'most_used' | 'official'
  page?: number
  size?: number
}): Promise<{ data: TemplateListItem[]; meta: PageMeta }>
```

`category` and `tags` were already present and already independent in this
interface — this feature's bug was never in this type, only in the Catalog
page/hook/component code that calls it (see research.md's Category/Tag
decision). `limit`/`cursor` are replaced by `page`/`size` to match
`docs/api/openapi.yaml`; `total_count` folds into `meta.totalElements`.

## `CatalogFilterState` — `src/features/home/hooks/useCatalogFilters.ts`

**Before**: `{ tag: string; model: string; search: string }` (URL params:
`?tag=&model=&q=`)

**After**: `{ category: string; tag: string; model: string; search: string;
sort: 'popular' | 'newest' }` (URL params: `?category=&tag=&model=&q=&sort=`)

`tag` keeps its name but now genuinely represents the Tag filter (backed by
`getTags()`) instead of secretly holding a category slug. `sort` defaults to
`'popular'` when absent from the URL (matching openapi.yaml's documented
`sort` default).

## Mock data additions — `src/features/home/api/templateClient.mock.ts`

- New `MOCK_TAGS: Tag[]` array (e.g. `email`, `formal`, `debugging-tips` —
  small, illustrative set matching the style of `MOCK_CATEGORIES`).
- Each `MOCK_TEMPLATES[i]` gains a `tags: Tag[]` value (1–2 tags per
  template) so the Tag filter has something to narrow.
- `getTemplates`'s mock implementation gains: separate `category` filtering
  (by `t.categories.some(c => slugs.includes(c.slug))`) distinct from `tags`
  filtering (by `t.tags.some(tag => slugs.includes(tag.slug))`); sort
  application (`popular` → `usage_count` desc, `newest` → `created_at` desc)
  before official-first stable-partitioning; and `page`/`size` slicing that
  produces a real `PageMeta` (`hasNext = (page + 1) * size < totalElements`).
- `getTags()`'s mock implementation returns `MOCK_TAGS` (optionally filtered
  by `params?.q`), replacing today's hardcoded `[]`.
