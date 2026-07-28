# Contract: `GET /templates` (catalog list, filter, sort, paginate)

Authoritative source: `docs/api/openapi.yaml` lines 499–544 (`PageMeta`
schema at lines 959–968). This file is a feature-scoped summary of the
subset this feature's FE client code must align to — it does not redefine
the contract.

## Request

`GET /templates?q=&category=&tags=&model=&sort=&page=&size=`

| Param | Type | Notes |
|---|---|---|
| `q` | string | Full-text search, EN & VI — unchanged by this feature |
| `category` | string | Comma-separated category slugs — **now actually sent**, was previously always omitted by the Catalog page |
| `tags` | string | Comma-separated tag slugs — **now actually sent as tags**, was previously receiving a category slug by mistake |
| `model` | string | AI-model code — unchanged |
| `sort` | `popular \| newest \| most_used \| official` | default `popular`; this feature exposes `popular`/`newest` as UI choices |
| `page` | integer | 0-based, default 0 — **new**, replaces the fictional `cursor` param this repo's client previously declared |
| `size` | integer | default 20, max 50 — **new**, replaces `limit` |

Guests and members both call this endpoint unauthenticated (`security: []`
per openapi.yaml) — no change to auth requirements.

## Response (`200`)

```json
{
  "data": [ /* TemplateListItem[], each now including a `tags` array */ ],
  "meta": {
    "page": 0,
    "size": 20,
    "totalElements": 132,
    "totalPages": 7,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

Note: `apiFetch` (`src/shared/utils/httpClient.ts`) already unwraps one
outer `{ data, meta }` `ApiResponse<T>` envelope per the project-wide
convention (CLAUDE.md "API & error conventions"). This endpoint's `T` is
itself `{ data: TemplateListItem[], meta: PageMeta }` — i.e. there are two
nested `data`/`meta` layers by coincidence of naming (the outer transport
envelope, and this endpoint's own paginated-list shape), both using the same
field names. `templateClient.real.ts` must call
`apiFetch<{ data: TemplateListItem[]; meta: PageMeta }>('/templates?...')`
and use the *returned* object's `.data`/`.meta` directly (that return value
is already past the outer-envelope unwrap).

## Client-side (this feature)

- `templateClient.types.ts` / `.real.ts` / `.mock.ts`: see data-model.md.
- Errors: standard `{ error: { code, message, ... } }` envelope, unchanged —
  no new error codes introduced by this feature (an invalid `category`/`tag`
  slug is not an error case per spec's Edge Cases — it's silently ignored,
  same as today's unknown-filter behavior).
