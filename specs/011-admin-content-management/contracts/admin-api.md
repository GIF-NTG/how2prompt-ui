# Contract: Admin API Surface Consumed by This Feature

This is not a new contract — it's the subset of `docs/api/openapi.yaml` (the repo's
authoritative wire contract) that this feature's admin clients integrate against,
recorded here so `/speckit-tasks` and implementation can point directly at concrete
endpoints instead of re-deriving them from the full spec. All requests carry
`Authorization: Bearer <accessToken>` and go through `apiFetch` (unwraps the
`{ data, meta }` envelope, or returns a bare array for endpoints documented as one —
including `/admin/ai-models` — per `src/shared/utils/httpClient.ts`; throws `ApiError`
on non-2xx). Every mutating endpoint requires the backend's `hasRole('ADMIN')` check —
a `403` from any of these is expected and normal for a non-admin caller who somehow
bypasses the frontend route guard.

## AI Models (User Story 1)

| Method  | Path                    | Request         | Response                        | Used for                                                                                       |
| ------- | ------------------------ | ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `GET`   | `/admin/ai-models`      | —               | `AiModel[]` (includes inactive) | Listing the catalog for management, incl. inactive entries the public `/ai-models` list hides. |
| `POST`  | `/admin/ai-models`      | `AiModelUpsert` | `201`, created `AiModel`        | Create (FR-002).                                                                               |
| `PATCH` | `/admin/ai-models/{id}` | `AiModelUpsert` | `200`, updated `AiModel`        | Edit, including toggling `isActive` (FR-002, FR-003, deactivation path for FR-004).            |

No `DELETE` endpoint exists — see `research.md` Decision 3 / spec.md FR-004a.

## Taxonomy — Categories only (User Story 2)

| Method  | Path                     | Request          | Response                  | Used for                                                 |
| ------- | -------------------------- | ------------------ | ---------------------------- | ----------------------------------------------------------- |
| `POST`  | `/admin/categories`      | `CategoryUpsert` | `201`, created `Category` | Create, optionally with `parentId` for nesting (FR-006). |
| `PATCH` | `/admin/categories/{id}` | `CategoryUpsert` | `200`, updated `Category` | Edit, including re-parenting (FR-006).                   |

Category listing (for the tree view) reuses whatever public/read endpoint already
lists categories (e.g. `GET /categories`, per the existing catalog feature) rather
than a new admin-only read — the contract doesn't define a separate admin listing
endpoint and the public one already returns the full tree.

**Uniqueness pre-check** (spec.md Clarifications, `research.md` Decision 6): before
calling `POST /admin/categories`, the client compares the submitted `name.en`
case-insensitively against sibling categories already loaded for the same `parentId`
and blocks submission locally on a match — the contract documents no dedicated
conflict error code for this endpoint (only `201` on success), so this is a
client-side safeguard, not a documented backend behavior. A duplicate that reaches
the backend anyway (e.g. a race) surfaces via the standard `ApiError` message, not a
special-cased error code.

No `DELETE` endpoint for categories, and **no admin tag endpoints at all** (create,
edit, delete, or merge) — see `research.md` Decision 3. Tag display in the taxonomy
screen and tag selection during template authoring (User Story 3) both read from
whatever public tag-listing endpoint the catalog feature already uses (e.g.
`GET /tags`) — no new read endpoint is introduced.

## Templates (User Story 3)

| Method  | Path                            | Request          | Response                                                                         | Used for                                                                                            |
| ------- | ---------------------------------- | ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `POST`  | `/admin/templates`              | `TemplateUpsert` | `201`, `TemplateDetail` (`status=draft`)                                         | Create a new draft (FR-009, FR-010).                                                                |
| `PATCH` | `/admin/templates/{id}`         | `TemplateUpsert` | `200`, `TemplateDetail`                                                          | Edit a draft in place, or edit a published template (creates a new version server-side per FR-014, last-write-wins per research.md Decision 7). |
| `POST`  | `/admin/templates/{id}/publish` | —                | `200` on success; `422` if a `{{placeholder}}` has no matching declared variable | Publish (FR-011, FR-013).                                                                           |

No `GET /admin/templates` list endpoint exists (discovered during
`/speckit-implement`, not caught during planning) — the real client's `list()`
returns an empty array; `TemplatesAdminPage` still supports create/edit/publish,
just not browsing prior templates against a real backend yet.

The `422` response on publish is the backend's authoritative placeholder/variable
validation (FR-011) — the frontend mirrors this check locally for immediate feedback
but treats the `422` as the source of truth, not just its own pre-check, per
Constitution Principle III. Tag association (`tagSlugs`) may only reference
already-existing tag slugs (FR-007a) — the UI offers a select-from-existing control,
never a free-text "create tag" input.

## Analytics Dashboard (User Story 4)

| Method | Path                     | Request                                        | Response                | Used for                                             |
| ------ | -------------------------- | ------------------------------------------------- | -------------------------- | ------------------------------------------------------- |
| `GET`  | `/admin/dashboard/stats` | Query: `from`, `to` (ISO dates, both optional) | `200`, `DashboardStats` | Metrics + custom date-range filter (FR-015, FR-016). |

No conversion-funnel field exists in `DashboardStats` — see `research.md` Decision 3
and `data-model.md`'s Dashboard Metric Snapshot scope note (FR-015a). Caching
(FR-017) is a backend behavior (the contract doesn't expose a cache-control signal
the frontend needs to act on); the frontend simply displays whatever the endpoint
returns per request, with no client-side cache duplicating server behavior.

## Error handling

All errors follow the repo-wide envelope (`ErrorResponse`): `{ error: { code,
message, details?, traceId? } }`, parsed into `ApiError` by `apiFetch`. No admin-
specific error codes are documented beyond the standard `403` (non-admin caller) and
the publish endpoint's `422` (placeholder validation) called out above — admin
clients follow the same `ApiError`-catch-and-map-to-outcome pattern already used by
`authClient.real.ts`.
