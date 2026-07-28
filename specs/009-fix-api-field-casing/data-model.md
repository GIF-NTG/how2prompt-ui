# Data Model: API field casing rename

This is a rename-only change — no new entities, no schema/behavior change. This
document is the authoritative field-by-field mapping the implementation must follow,
derived from `docs/api/openapi.yaml`.

## TemplateListItem (`src/features/home/types.ts`)

| Current (snake_case) | Renamed to (camelCase, per OpenAPI) | Notes |
| --- | --- | --- |
| `cover_image` | `coverImage` | nullable, keep as-is |
| `is_official` | `isOfficial` | |
| `usage_count` | `usageCount` | |
| `favorite_count` | `favoriteCount` | |
| `is_favorited` | `isFavorited` | |
| `created_at` | `createdAt` | |
| `id`, `slug`, `title`, `description`, `author`, `categories`, `tags`, `supported_models` | unchanged names, but `supported_models` → `supportedModels`; nested objects renamed per tables below | |
| `supported_models` | `supportedModels` | array of model codes (strings) |

## TemplateDetail (`src/features/template-detail/types.ts`)

Extends `TemplateListItem`'s fields (same renames as above) plus:

| Current (snake_case) | Renamed to (camelCase) | Notes |
| --- | --- | --- |
| `view_count` | `viewCount` | |
| `current_version` | `currentVersion` | see `TemplateVersion` table |

## TemplateVersion (nested in `TemplateDetail.currentVersion`)

| Current (snake_case) | Renamed to (camelCase) | Notes |
| --- | --- | --- |
| `prompt_body` | `promptBody` | |
| `example_output` | `exampleOutput` | |
| `created_at` | `createdAt` | |
| `guide` | unchanged | |
| `version` | **unchanged in this fix** | OpenAPI names this `versionNumber`, a substantive (non-casing) rename — out of scope per `research.md`; keep `version` for now |

## AuthorBrief (nested in `TemplateListItem.author` / `TemplateDetail.author`)

| Current (snake_case) | Renamed to (camelCase) |
| --- | --- |
| `full_name` | `fullName` |
| `avatar_url` | `avatarUrl` |
| `id`, `username`, `type` | unchanged |

## Category (nested in `categories[]`)

| Current (snake_case) | Renamed to (camelCase) |
| --- | --- |
| `parent_id` | `parentId` |
| `sort_order` | `sortOrder` |
| `template_count` | `templateCount` |
| `id`, `slug`, `name`, `description`, `icon`, `color` | unchanged |

## Tag (nested in `tags[]`)

| Current (snake_case) | Renamed to (camelCase) |
| --- | --- |
| `usage_count` | `usageCount` |
| `id`, `slug`, `name` | unchanged |

## AiModel (`getModels()` response)

| Current (snake_case) | Renamed to (camelCase) |
| --- | --- |
| `model_type` | `modelType` |
| `icon_url` | `iconUrl` |
| `is_active` | `isActive` |
| `sort_order` | `sortOrder` |
| `id`, `code`, `name`, `provider`, `description`, `capabilities` | unchanged |

## Other response shapes

| Current (snake_case) | Renamed to (camelCase) | Where |
| --- | --- | --- |
| `{ is_favorited: boolean }` | `{ isFavorited: boolean }` | `TemplateClient.toggleFavorite`, `TemplateDetailClient.toggleFavorite` return type |

## Explicitly NOT renamed (not a field-casing issue)

- Query param value `most_used` in the `sort` enum (`getTemplates({ sort })`) — this
  is a literal enum *value* string defined as `most_used` in
  `docs/api/openapi.yaml` (line 525), not a JSON field key. Leave as-is.
- `TemplateVersion.version` (see table above) — substantive rename, tracked as a
  follow-up in `research.md`, not part of this change.
- `TemplateListItem.tags` placement (present on the FE list-item type and used by the
  mock client's tag filter, but only on `TemplateDetail` in the OpenAPI schema) —
  structural, not casing; tracked as a follow-up in `research.md`.

## Validation rules

None — this change carries no new validation. Existing nullability
(`string | null`) is preserved 1:1 for every renamed field.

## State transitions

None — no state machine involved in this change.
