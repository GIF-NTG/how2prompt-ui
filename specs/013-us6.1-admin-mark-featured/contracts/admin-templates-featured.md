# Contract: Featured Flag on the Admin Templates Endpoint

This is not a new endpoint — it's an additional field on the existing
`PATCH /admin/templates/{id}` request/response, already used by
`src/features/admin/api/templatesAdminClient.real.ts`'s `patchMetadata`/`update()`.
All requests carry `Authorization: Bearer <accessToken>` and go through `apiFetch`.
Requires the backend's admin check — a `403` for a non-admin caller is expected and
normal, same as every other admin write.

| Method  | Path                     | Request field (new)                       | Response field (new)                     | Used for                                    |
| ------- | ------------------------ | ------------------------------------------ | ------------------------------------------ | -------------------------------------------- |
| `PATCH` | `/admin/templates/{id}`  | `isFeatured: boolean` (optional)          | —                                           | Mark/unmark Featured (FR-001, FR-002).      |
| `GET`   | `/templates/{id}`        | —                                           | `featuredAt: string \| null` (verified against live `/v3/api-docs` — **not** `isFeatured`) | Read current Featured state for the admin list badge (FR-005) and edit form initial value. |

`GET /templates/featured` (already implemented, `templateClient.real.ts`
`getFeatured`) is unchanged by this feature — it is the backend's own filtered view
and requires no client-side change (research.md Decision 3).

## Field mapping (per research.md Decision 1, updated post-implementation)

- **Write**: `TemplateUpsert.isFeatured` → sent verbatim as `isFeatured` in the
  `PATCH /admin/templates/{id}` body, alongside the existing `titleI18n`,
  `descriptionI18n`, `categoryIds`, `tagIds`, `modelIds` fields built by
  `patchMetadata`.
- **Read**: `RawTemplateDetail.featuredAt?: string | null` → mapped to
  `AdminTemplate.isFeatured` via `Boolean(raw.featuredAt)` in `mapAdminTemplate`
  (same field/derivation used for `TemplateListItem.isFeatured` in
  `templateClient.real.ts`'s `mapTemplateListItem`). The write and read field
  names differ on the real backend — this was originally assumed symmetric
  (`isFeatured` both ways) and shipped that way; fixed after a bug report that
  the admin checkbox never showed as checked on re-open, even though the save
  itself succeeded.

## Error handling

No new error codes. Same `{ error: { code, message, details?, traceId? } }`
envelope as every other `PATCH /admin/templates/{id}` failure (validation error,
`401`/`403`, `404` for an unknown id) — `apiFetch` already throws `ApiError` for
these; no new handling is added by this feature.

## Out of scope

- No dedicated `POST /admin/templates/{id}/feature` / `.../unfeature` endpoint —
  not proposed by US-6.1 and not present in the live backend.
- No change to `GET /templates/featured`'s response shape or ordering.
