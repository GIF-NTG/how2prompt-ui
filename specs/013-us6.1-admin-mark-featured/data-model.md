# Phase 1 Data Model: Admin Mark Template as Featured

This feature adds one field to an existing entity already modeled in
`src/features/admin/api/templatesAdminClient.types.ts`. No new entity is
introduced.

## Template (extended)

Existing fields unchanged. New field:

| Field        | Type      | Required | Notes                                                                                      |
| ------------ | --------- | -------- | -------------------------------------------------------------------------------------------- |
| `isFeatured` | `boolean` | Yes      | Defaults to `false`. Independent of `status` (`draft`/`published`) and `currentVersion` — toggling it MUST NOT create a new version (FR-006). |

### Affected types

- **`TemplateUpsert`** (`templatesAdminClient.types.ts`): add `isFeatured: boolean`
  — sent on every `create`/`update` call, same as `categoryIds`/`tagSlugs` today.
- **`AdminTemplate`** (`templatesAdminClient.types.ts`): add `isFeatured: boolean`
  — read back after create/update/list, drives the list badge (FR-005).
- **`RawTemplateDetail`** (`templatesAdminClient.real.ts`, extends
  `RawTemplateListItem` from the home feature): add optional
  `featuredAt?: string | null` — the real backend's read side never sends
  `isFeatured` (verified against the live `/v3/api-docs`), only this timestamp;
  mapped via `Boolean(raw.featuredAt)` in `mapAdminTemplate` and
  `mapTemplateListItem`.

### State transitions

```
isFeatured: false  --[Admin toggles on + saves]-->  isFeatured: true
isFeatured: true   --[Admin toggles off + saves]-->  isFeatured: false
```

No other state depends on this transition. `status` (`draft` → `published`) and
`currentVersion` (versioning on content edits) are unaffected and unaffected by
this field, per FR-006 and the Edge Cases in spec.md (featuring a draft template is
allowed; it only becomes publicly visible once published, same as any other public
listing).

### Validation rules

- `isFeatured` has no validation beyond being a boolean — no min/max/regex, no
  cross-field constraint with any other template attribute (spec.md Assumptions:
  no cap on how many templates may be featured simultaneously).
