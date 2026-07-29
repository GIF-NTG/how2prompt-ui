# Data Model: Prompt History & Favorites

Frontend-only feature — these are the TypeScript domain types this feature
introduces in `src/features/history/types.ts`, mapped from
`docs/api/openapi.yaml` schemas. No new backend/database entities (see
spec.md Assumptions).

## HistoryListItem

Mirrors `GeneratedPromptListItem` (openapi.yaml).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | uuid |
| `title` | `string \| null` | |
| `templateId` | `string \| null` | `null` if the source template was deleted. Also the routing target for "Re-run" (`/templates/{templateId}?reload=...`) — the contract does not expose a `templateSlug` on this record, but `/templates/{id}`'s path param is itself documented as `id` (uuid), so `templateId` is the correct value to pass, consistent with how `templateDetailClient.getDetail` already just forwards whatever identifier string it's given to that same path template. |
| `templateTitle` | `I18nString` | |
| `aiModelCode` | `string` | |
| `promptSnippet` | `string` | first 150 chars of `finalPrompt` |
| `createdAt` | `string` | ISO date-time |

## HistoryDetail

Mirrors `GeneratedPromptDetail` (`allOf` `HistoryListItem` +):

| Field | Type | Notes |
|---|---|---|
| `templateVersionId` | `string \| null` | used to detect "newer version available" (FR-010) |
| `inputValues` | `Record<string, unknown>` | fed into `useGenerateForm`'s pre-fill override |
| `extraInstructions` | `string \| null` | |
| `finalPrompt` | `string` | shown even when the template is gone (FR-009) |

## HistoryFilters

Local UI state, not a wire type (query params on `GET /generated-prompts`):

| Field | Type | Maps to query param |
|---|---|---|
| `templateId` | `string` | `templateId` |
| `model` | `string` | `model` |
| `from` | `string` (date) | `from` |
| `to` | `string` (date) | `to` |

## FavoriteTemplateItem

Reuses the existing `TemplateListItem` (`src/features/home/types.ts`) as-is
— `GET /favorites` returns the same shape as the catalog list per
openapi.yaml (`items: { $ref: '#/components/schemas/TemplateListItem' }`).
No new type needed here.

## State transitions

- **HistoryListItem → soft-deleted**: `DELETE /generated-prompts/{id}`
  removes it from the client-side list immediately (optimistic); no local
  "deleted" state is modeled since deleted entries are simply absent from
  subsequent `GET /generated-prompts` responses.
- **Favorite toggle**: `isFavorited: false → true` via `POST
  /templates/{id}/favorite`; `true → false` via `DELETE
  /templates/{id}/favorite`. Both return `{ isFavorited }` reflecting the
  new state (see research.md's `toggleFavorite` fix).
