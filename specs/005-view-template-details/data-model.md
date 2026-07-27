# Data Model: View Template Details

**Feature**: `specs/005-view-template-details`
**Date**: 2026-07-27

**Scope**: Read-only template detail page. No dynamic form, no prompt generation (Epic 3 out of scope).

## Entities

### I18nString

A string value with language variants. Used for template titles, descriptions,
guide text, and example output.

```typescript
interface I18nString {
  en: string
  vi?: string
}
```

### AuthorBrief

Minimal author info shown on the template detail page.

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

A taxonomy label associated with the template. Displayed as the eyebrow badge
on the detail page.

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

### TemplateDetail

The primary entity displayed on the detail page. Returned by
`GET /api/v1/templates/{slug}`.

```typescript
interface TemplateDetail {
  id: string // internal UUID (used for favorite endpoint)
  slug: string // URL-friendly identifier (used in route)
  title: I18nString
  description: I18nString
  cover_image: string | null
  is_official: boolean
  author: AuthorBrief
  categories: Category[]
  supported_models: string[] // e.g. ["gpt-4o", "claude"]
  usage_count: number
  favorite_count: number
  is_favorited: boolean // false for guests
  view_count: number
  created_at: string // ISO 8601
  current_version: TemplateVersion
}
```

### TemplateVersion

The active version of a template's prompt body, guide, and example output.
Nested inside `TemplateDetail.current_version`. The detail page uses `guide`
and `example_output` for read-only display.

```typescript
interface TemplateVersion {
  version: number
  prompt_body: string // template with {{variable}} placeholders (read-only reference)
  guide: I18nString // usage guide text (displayed on detail page)
  example_output: I18nString // sample generated prompt (displayed on detail page)
  created_at: string // ISO 8601
}
```

### AiModel

An AI model that templates can target. The detail page displays model
compatibility as tag pills.

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

## Relationships

```
TemplateDetail ──>── TemplateVersion        (one:current_version)
TemplateDetail ──>── AuthorBrief             (many-to-one)
TemplateDetail ──*── Category                (many-to-many)
TemplateDetail ──*── string                  (supported_models: model codes)
```

## State Transitions

### Page Load

```
[loading] ──(API success)──> [loaded] ──(display template data)
[loading] ──(API error 404)──> [not_found] ──(show 404 state)
[loading] ──(API error other)──> [error] ──(show error state with retry)
```

### Favorite Toggle

```
[not_favorited] ──(user clicks heart)──> [favorited] ──(API call)──> [favorited confirmed]
[favorited] ──(user clicks heart)──> [not_favorited] ──(API call)──> [not_favorited confirmed]
```

## Validation Rules

- **Slug parameter**: Must be a non-empty string; invalid slugs return 404.
- **Favorite toggle**: Only available to authenticated users. Guests see no toggle.
