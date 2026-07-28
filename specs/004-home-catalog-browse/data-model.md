# Data Model: Home — Template Catalog

**Feature**: `specs/004-home-catalog-browse`
**Date**: 2026-07-27

## Entities

### I18nString

A string value with language variants. Used for template titles, descriptions, tag names,
category names, and variable labels.

```typescript
interface I18nString {
  en: string
  vi?: string
}
```

### TemplateListItem

The primary entity displayed in the catalog grid, rails, and search results. Returned
by `GET /api/v1/templates`, `/templates/featured`, and `/templates/trending`.

```typescript
interface TemplateListItem {
  id: string // UUID
  slug: string
  title: I18nString
  description: I18nString
  cover_image: string | null
  is_official: boolean
  author: AuthorBrief
  categories: Category[]
  supported_models: string[] // e.g. ["gpt-4o", "claude-opus-4"]
  usage_count: number
  favorite_count: number
  is_favorited: boolean // true if current user has favorited
  created_at: string // ISO 8601
}
```

### AuthorBrief

Minimal author info shown on template cards.

```typescript
interface AuthorBrief {
  id: string | null
  full_name: string | null
  username: string | null
  avatar_url: string | null
  type: 'admin' | 'user' | 'system' | 'forked'
}
```

### Category

A taxonomy label for filtering. Returned by `GET /api/v1/categories`.

```typescript
interface Category {
  id: string
  slug: string
  name: I18nString
  description: I18nString
  icon: string | null
  color: string | null
  parent_id: string | null
  sort_order: number
  template_count: number
}
```

### Tag

A lightweight label for filtering. Returned by `GET /api/v1/tags`.

```typescript
interface Tag {
  id: string
  slug: string
  name: string
  usage_count: number
}
```

### AiModel

An AI model that templates can target. Returned by `GET /api/v1/ai-models`.

```typescript
interface AiModel {
  id: string
  code: string // e.g. "claude-opus-4"
  name: string // e.g. "Claude Opus 4"
  provider: string
  model_type: 'text' | 'image' | 'video' | 'audio' | 'multimodal'
  description: string | null
  capabilities: Record<string, unknown>
  icon_url: string | null
  is_active: boolean
  sort_order: number
}
```

### CatalogFilters

The local state representing the current filter/search combination. Synced to URL.

```typescript
interface CatalogFilters {
  search: string // raw search input (pre-debounce)
  tag: string // active tag slug, or '' for "all"
  model: string // active model code, or '' for "all"
}
```

### CatalogPageData

The aggregated data fetched on page load.

```typescript
interface CatalogPageData {
  templates: TemplateListItem[] // full grid (paginated)
  featured: TemplateListItem[] // featured rail
  trending: TemplateListItem[] // trending rail
  categories: Category[] // for tag chips (categories serve as the chip taxonomy)
  tags: Tag[] // additional tag options
  models: AiModel[] // for model dropdown
  total_count: number // for count badges
  page_info: PageInfo // cursor-based pagination
}
```

### PageInfo

Cursor-based pagination metadata.

```typescript
interface PageInfo {
  next_cursor: string | null
  has_next: boolean
}
```

## Relationships

```
TemplateListItem  ──*──>  Category      (many-to-many via API)
TemplateListItem  ──*──>  Tag           (many-to-many via API)
TemplateListItem  ──*──>  AiModel       (via supported_models: string[])
TemplateListItem  ──>──  AuthorBrief   (many-to-one)
Category          ──>──  Category      (self-referential via parent_id for hierarchy)
```

## State Transitions

### Filter State

```
[idle] ──(user types in search)──> [searching] ──(300ms debounce)──> [filtered]
[idle] ──(user clicks tag chip)──> [filtered]
[idle] ──(user selects model)──> [filtered]
[filtered] ──(user resets all)──> [idle]
[filtered] ──(URL change / back/forward)──> [filtered with new params]
```

### Template Card Favorite Toggle

```
[not favorited] ──(user clicks heart)──> [favorited] ──(API call)──> [favorited confirmed]
[favorited] ──(user clicks heart)──> [not favorited] ──(API call)──> [not favorited confirmed]
```

## Validation Rules

- Search query: no length limit enforced client-side; empty string means "no filter"
- Tag filter: must be a valid slug from the tags list; invalid slugs are ignored on load
- Model filter: must be a valid code from the ai-models list; invalid codes are ignored on load
- The "all" state for tag/model uses empty string `''` in filter state
