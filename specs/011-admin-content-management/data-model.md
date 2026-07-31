# Phase 1 Data Model: Admin & Content Management

All shapes below are the frontend's TypeScript view of the entities from the feature
spec's Key Entities section, sourced from `docs/api/openapi.yaml`'s schemas (the
authoritative wire contract per Constitution Principle III). Field names are
`camelCase` — `apiFetch` already unwraps the `{ data, meta }` envelope, or returns the
bare array directly for endpoints (including `/admin/ai-models`) documented as a plain
array, per `src/shared/utils/httpClient.ts`. Fields present in the backend schema but
out of scope per `research.md` Decision 3 are noted, not modeled.

## Session (no change)

`src/features/auth/api/types.ts`'s `Session.isAdmin: boolean` already exists —
research.md Decision 1. Nothing to add here.

## AiModel

| Field          | Type                                                      | Notes                                                                 |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `id`           | `string` (uuid)                                           |                                                                       |
| `code`         | `string`                                                  | Unique short identifier, e.g. `"claude-opus-4"`.                      |
| `name`         | `string`                                                  | Display name.                                                         |
| `provider`     | `string`                                                  | e.g. `"anthropic"`.                                                   |
| `modelType`    | `'text' \| 'image' \| 'video' \| 'audio' \| 'multimodal'` |                                                                       |
| `description`  | `string \| null`                                          |                                                                       |
| `capabilities` | `Record<string, unknown>`                                 | Free-form JSON (e.g. `{ vision: true, contextWindow: 200000 }`).      |
| `iconUrl`      | `string \| null`                                          |                                                                       |
| `isActive`     | `boolean`                                                 | Deactivation is the only removal affordance (research.md Decision 3). |
| `sortOrder`    | `number`                                                  | Controls display order in selection dropdowns.                        |

**Upsert payload** (`AiModelUpsert`, used for both create and edit) adds
`defaultConfig: Record<string, unknown>` on top of the above (minus `id`); `code`,
`name`, `provider`, `modelType` are required.

**Validation rules** (FR-002, FR-004): `code`, `name`, `provider`, `modelType`
required on create. No delete action is exposed — see FR-004a.

## Category

| Field           | Type                                         | Notes                                           |
| --------------- | --------------------------------------------- | ------------------------------------------------ |
| `id`            | `string` (uuid)                              |                                                 |
| `slug`          | `string`                                     |                                                 |
| `name`          | `I18nString` (`{ en: string; vi?: string }`) |                                                 |
| `description`   | `I18nString`                                 |                                                 |
| `icon`          | `string \| null`                             |                                                 |
| `color`         | `string \| null`                             |                                                 |
| `parentId`      | `string \| null` (uuid)                      | Nesting relationship — self-referential.        |
| `sortOrder`     | `number`                                     |                                                 |
| `templateCount` | `number`                                     | Read-only, count of templates in this category. |

**Relationships**: A `Category` may have a `parentId` pointing to another `Category`,
forming an arbitrary-depth tree (FR-006). No cycle-prevention is documented by the
contract; the admin UI must not offer a category as its own ancestor in the parent
picker (client-side guard, not a backend-enforced rule).

**Uniqueness rule** (spec.md Clarifications, FR-006): `name.en` (the canonical
comparison field) must be unique, case-insensitive, among categories sharing the same
`parentId` (including `null` for top-level categories). Enforced client-side before
submit per `research.md` Decision 6, since the contract documents no dedicated
conflict error code for this case.

**Upsert payload** (`CategoryUpsert`): `slug`, `name` required; `parentId` optional
(nullable). No delete action is exposed — see FR-004a.

## Tag (read-only in this feature)

| Field        | Type            | Notes |
| ------------ | --------------- | ----- |
| `id`         | `string` (uuid) |       |
| `slug`       | `string`        |       |
| `name`       | `string`        |       |
| `usageCount` | `number`        |       |

**Scope note** (FR-007, FR-007a): Read-only. No admin create/edit/delete/merge
endpoints exist in the contract (research.md Decision 3) — the taxonomy screen
displays existing tags (read via the existing public tag-listing endpoint) for
reference, and the template authoring screen (User Story 3) lets an Admin select
from this existing list when associating tags with a template. No tag-creation
control exists anywhere in this feature.

## Template (admin-authoring view)

Composed from `TemplateUpsert` (write) and `TemplateDetail`/`TemplateVersion` (read),
per `docs/api/openapi.yaml`.

| Field            | Type                             | Notes                                                                                                                                            |
| ---------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | `string` (uuid)                  | Absent until first save.                                                                                                                         |
| `title`          | `I18nString`                     | Required.                                                                                                                                        |
| `description`    | `I18nString`                     |                                                                                                                                                   |
| `coverImage`     | `string \| null`                 | URL/reference to an uploaded image.                                                                                                              |
| `categoryIds`    | `string[]` (uuid)                |                                                                                                                                                   |
| `tagSlugs`       | `string[]`                       | Existing tag slugs only (FR-007a) — no new tag can be created from this screen.                                                                  |
| `modelCodes`     | `string[]`                       | AI model codes this template supports.                                                                                                           |
| `promptBody`     | `string`                         | Contains `{{varKey}}` placeholders. Required.                                                                                                    |
| `systemPrompt`   | `string \| null`                 |                                                                                                                                                   |
| `exampleOutput`  | `string \| null`                 |                                                                                                                                                   |
| `guide`          | `I18nString`                     | Usage guide.                                                                                                                                      |
| `variables`      | `TemplateVariable[]`             | See below.                                                                                                                                        |
| `isOfficial`     | `boolean`                        | Read-only, set by the backend on publish.                                                                                                        |
| `status`         | implied `'draft' \| 'published'` | Not a literal enum in the contract's schema, but referenced by user stories (US-5.3) and the `/admin/templates/{id}/publish` action's semantics. |
| `currentVersion` | `TemplateVersion`                | Read view only — see Template Version below.                                                                                                     |

**State transition** (FR-010, FR-011, FR-013, FR-014): `draft` →(publish, validated)→
`published`. Editing a `published` template creates a new `TemplateVersion` rather
than mutating the current one in place (enforced server-side per US-5.3; the frontend
must not assume in-place mutation when refreshing state after a save). Concurrent
edits by different Admins are last-write-wins (spec.md Clarifications, research.md
Decision 7) — no version/conflict token is sent or checked.

## Template Version

**Cross-feature consumer** (FR-014a): `TemplateDetailPage.tsx`'s reload flow
(`src/features/template-detail`, built in Epic 4 — `specs/010-us4-prompt-history-favorites`)
already compares `HistoryDetail.templateVersionId` against a template's
`currentVersion.id` (this section) and renders `NewerVersionBadge` when they differ.
No new code was needed for this feature; `/speckit-analyze` only flagged the missing
test coverage for that existing comparison.

| Field           | Type                 | Notes                         |
| --------------- | --------------------- | ------------------------------ |
| `id`            | `string` (uuid)      |                               |
| `versionNumber` | `number`             |                               |
| `promptBody`    | `string`             |                               |
| `systemPrompt`  | `string \| null`     |                               |
| `exampleOutput` | `string \| null`     |                               |
| `guide`         | `I18nString`         |                               |
| `variables`     | `TemplateVariable[]` |                               |
| `variants`      | `TemplateVariant[]`  | Optional per-model overrides. |

## Template Variable

| Field          | Type                                                                                                                             | Notes                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `varKey`       | `string`                                                                                                                         | Must match a `{{varKey}}` placeholder in `promptBody` — see Validation rules below. |
| `label`        | `I18nString`                                                                                                                     | Required.                                                                           |
| `description`  | `I18nString`                                                                                                                     |                                                                                     |
| `placeholder`  | `I18nString`                                                                                                                     | Form-field placeholder text (not the `{{}}` template placeholder).                  |
| `inputType`    | `'text' \| 'textarea' \| 'select' \| 'multiselect' \| 'number' \| 'boolean' \| 'date' \| 'file' \| 'url' \| 'color' \| 'slider'` | Required.                                                                           |
| `isRequired`   | `boolean`                                                                                                                         |                                                                                     |
| `defaultValue` | `string \| null`                                                                                                                 |                                                                                     |
| `options`      | `{ value: string; label: I18nString }[]`                                                                                        | For `select`/`multiselect`.                                                         |
| `validation`   | `Record<string, unknown>`                                                                                                         | e.g. `{ min, max, regex }`.                                                         |
| `sortOrder`    | `number`                                                                                                                          |                                                                                     |

**Validation rule** (FR-011): Every `{{placeholder}}` token in `promptBody` MUST have a
`TemplateVariable` with a matching `varKey`, checked before publish is allowed (the
backend is the enforcing authority per `/admin/templates/{id}/publish`'s documented
`422` response; the frontend mirrors this check client-side for immediate feedback,
matching the existing renderer's placeholder-parsing logic in
`src/features/template-generate/utils/renderTemplate.ts` where reasonable).

## Template Variant

| Field                  | Type                       | Notes                                |
| ---------------------- | --------------------------- | -------------------------------------- |
| `aiModelCode`          | `string`                   | Which model this variant applies to. |
| `promptBodyOverride`   | `string \| null`           |                                       |
| `systemPromptOverride` | `string \| null`           |                                       |
| `modelConfig`          | `Record<string, unknown>` |                                       |

## Dashboard Metric Snapshot

Modeled on `DashboardStats`.

| Field                   | Type                                                              | Notes                              |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------------- |
| `totalUsers`            | `number`                                                          |                                    |
| `dau` / `wau` / `mau`   | `number`                                                          | Daily/weekly/monthly active users. |
| `totalTemplates`        | `number`                                                          |                                    |
| `totalPromptsGenerated` | `number`                                                          |                                    |
| `promptsToday`          | `number`                                                          |                                    |
| `topTemplates`          | `{ templateId: string; title: I18nString; usageCount: number }[]` |                                    |
| `topModels`             | `{ modelCode: string; usageCount: number }[]`                     |                                    |

**Scope note** (FR-015a): No signup→first-generate conversion funnel field exists in
the contract (research.md Decision 3) — this metric is not modeled here and is
omitted from the dashboard UI until the backend adds it.

**Query parameters**: `from`, `to` (ISO dates) — drive FR-016's custom date-range
filter; both optional per the contract (omitting both presumably returns an
all-time/default window, left to the backend's own default).
