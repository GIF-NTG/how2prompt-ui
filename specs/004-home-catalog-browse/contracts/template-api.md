# API Contract: Template Browsing, Filtering, Search

**Feature**: `specs/004-home-catalog-browse`
**Source**: `docs/api/openapi.yaml`
**Date**: 2026-07-27

## Endpoints Used

### 1. Browse Templates (paginated grid)

```
GET /api/v1/templates
```

**Query Parameters**:

| Name     | Type     | Default   | Description                          |
|----------|----------|-----------|--------------------------------------|
| `q`      | string   | (none)    | Full-text search (title, description)|
| `category` | string | (none)   | Category slug, comma-separated       |
| `tags`   | string   | (none)    | Tag slug, comma-separated            |
| `model`  | string   | (none)    | Model code (e.g. `claude-opus-4`)    |
| `sort`   | string   | `popular` | Enum: `popular`, `newest`, `most_used`, `official` |
| `limit`  | integer  | `20`      | Max 50                               |
| `cursor` | string   | (none)    | Opaque cursor for next page          |

**Response 200**:
```json
{
  "data": [TemplateListItem],
  "page_info": { "next_cursor": "string|null", "has_next": boolean },
  "total_count": integer
}
```

### 2. Featured Templates (rail)

```
GET /api/v1/templates/featured
```

**Response 200**: `TemplateListItem[]`

### 3. Trending Templates (rail)

```
GET /api/v1/templates/trending
```

**Query Parameters**:

| Name     | Type     | Default | Description                  |
|----------|----------|---------|------------------------------|
| `window` | string   | `7d`    | Enum: `24h`, `7d`, `30d`     |

**Response 200**: `TemplateListItem[]`

### 4. AI Models (dropdown)

```
GET /api/v1/ai-models
```

**Response 200**: `AiModel[]`

### 5. Categories (chip filters)

```
GET /api/v1/categories
```

**Response 200**: `Category[]`

### 6. Tags (chip filters, autocomplete)

```
GET /api/v1/tags
```

**Query Parameters**:

| Name    | Type    | Default | Description          |
|---------|---------|---------|----------------------|
| `q`     | string  | (none)  | Search tags by name  |
| `limit` | integer | `20`    | Max results          |

**Response 200**: `Tag[]`

## Client-Side TypeScript Interface

The frontend `TemplateClient` interface exposes these methods:

```typescript
interface TemplateClient {
  getTemplates(params: {
    q?: string
    category?: string
    tags?: string
    model?: string
    sort?: 'popular' | 'newest' | 'most_used' | 'official'
    limit?: number
    cursor?: string
  }): Promise<{ data: TemplateListItem[]; page_info: PageInfo; total_count: number }>

  getFeatured(): Promise<TemplateListItem[]>

  getTrending(params?: { window?: '24h' | '7d' | '30d' }): Promise<TemplateListItem[]>

  getModels(): Promise<AiModel[]>

  getCategories(): Promise<Category[]>

  getTags(params?: { q?: string; limit?: number }): Promise<Tag[]>

  toggleFavorite(templateId: string): Promise<{ is_favorited: boolean }>
}
```

## Error Shape

All errors follow the standard envelope:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable message",
    "details": {},
    "trace_id": "uuid"
  }
}
```

The frontend `ApiError` class (from `shared/utils/httpClient.ts`) parses this envelope.
Catalog pages show non-blocking inline errors near the search box on API failure.

## Notes

- All endpoints are Guest-accessible (`security: []`). No `Authorization` header
  needed for browsing.
- `GET /api/v1/templates` uses cursor-based pagination, not offset-based. The frontend
  fetches page 1 on mount, then appends subsequent pages on "Load More" or infinite
  scroll (implementation choice — the mockup shows a full grid, so "Load More" is
  simpler).
- The `is_favorited` field on `TemplateListItem` is only meaningful for authenticated
  users. For guests, it is always `false`. The frontend hides the favorite toggle for
  guests (FR-007).
