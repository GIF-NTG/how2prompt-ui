# Phase 0 Research: Admin & Content Management

## Decision 1 — `isAdmin` is already wired; no auth-layer changes needed

**Decision**: Confirmed that `Session.isAdmin` (`src/features/auth/api/types.ts`),
`authClient.mock.ts`'s seeded `admin@how2prompt.dev` / `admin1234` account, and
`authClient.real.ts`'s `toBool(profile.isAdmin)` mapping from the backend's
`UserProfile.isAdmin` all still exist and are unaffected by the earlier removal of
`src/features/admin/*` at commit `f0832cc`. This plan makes zero changes to
`src/features/auth`.

**Rationale**: When Epic 5 was first built, `isAdmin` was added to the session as
part of that work; when the feature was later removed, only `src/features/admin/*`,
its routes, and the `TopBar` nav entry were deleted — the auth-layer plumbing was
left in place (confirmed by reading the current files, not assumed). Rebuilding it
would be redundant and would risk a duplicate/conflicting `isAdmin` definition.

**Alternatives considered**: N/A — this is a factual confirmation, not a choice.

## Decision 2 — No route guard exists yet; rebuild `RequireAdmin`

**Decision**: Add `RequireAdmin` (`src/features/admin/components/RequireAdmin.tsx`), a
route wrapper that: while `isRestoring`, renders nothing (avoids a flash);
once resolved, redirects to `/login` if `session` is null, redirects to `/` if
`session.isAdmin` is false, and renders `<Outlet />` otherwise.

**Rationale**: `RequireAdmin.tsx` was deleted along with the rest of `src/features/admin`
at commit `f0832cc` — `App.tsx` currently has zero route-level authorization; every
existing route is either public or the auth flow itself. FR-001/SC-003 require 100%
of non-Admin access attempts to be blocked; that has to be enforced client-side at
minimum (route level) even though the backend is the actual authority.

**Alternatives considered**: Per-page `if (!session?.isAdmin) return <Navigate />`
duplicated in every admin page — rejected as exactly the kind of repeated logic a
shared route wrapper exists to avoid, and easier to get subtly wrong four times than
once.

## Decision 3 — Contract gaps: this implementation ships only what `docs/api/openapi.yaml` documents

**Decision**: Per Constitution Principle III, `docs/api/openapi.yaml` is the
authoritative wire contract and supersedes `agent/BA.md`/user-story detail where they
disagree. Comparing the two surfaced real gaps — this plan scopes the frontend to what
the contract currently exposes, deferring the rest as an explicit backend follow-up:

| Spec requirement                                          | Contract support                                                                                                                                                          | Scoping decision                                                                                                                                                                                                                                              |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deleting an unused AI model                                | No `DELETE /admin/ai-models/{id}` in the contract — only `GET`/`POST /admin/ai-models` and `PATCH /admin/ai-models/{id}`                                                  | Ship create + edit + activate/deactivate (`isActive` via `PATCH`) only (FR-002, FR-004). No delete action in the UI (FR-004a).                                                                                                                                |
| Deleting a category                                        | No `DELETE /admin/categories/{id}` — only `POST`/`PATCH /admin/categories`                                                                                                | Ship create + edit (including re-parenting) only (FR-006). No delete action in the UI (FR-004a).                                                                                                                                                              |
| Creating/editing/deleting/merging tags                     | **No admin tag endpoints exist at all** — the contract only has a read-only `Tag` schema (used elsewhere for display), no `POST/PATCH/DELETE` under `/admin/...` for tags | Tag management is entirely out of scope for this implementation, including creation (this is narrower than the original spec draft, corrected during this planning pass — see spec.md FR-007/FR-007a). The taxonomy screen displays existing tags read-only for reference/selection; a visible "Tag management is not yet available" note replaces any tag CRUD/merge UI. |
| Signup→first-generate conversion funnel on the dashboard   | `DashboardStats` schema has no funnel field — only `totalUsers`, `dau/wau/mau`, `totalTemplates`, `totalPromptsGenerated`, `promptsToday`, `topTemplates`, `topModels`    | Dashboard ships every field the contract provides; the conversion-funnel metric is omitted until the backend adds it (FR-015a).                                                                                                                               |

**Discovered during `/speckit-implement`** (not caught at planning time): the contract
also has no `GET /admin/templates` list endpoint — only `POST /admin/templates`,
`PATCH /admin/templates/{id}`, and `POST /admin/templates/{id}/publish`. The real
`templatesAdminClient.real.ts`'s `list()` returns `[]`; `TemplatesAdminPage` still
supports authoring, editing, and publishing new templates, but can't browse
previously-created ones against a real backend until this endpoint exists. The mock
client keeps a full in-memory store so this remains fully demonstrable without one.

**Rationale**: Building UI against endpoints that don't exist in the one authoritative
contract this repo has would either silently 404 in the real client or require
inventing a shape the backend team hasn't committed to — both violate Principle III.
Scoping down to "what the contract supports today, with the gap named" keeps the
frontend honest about what actually works end-to-end, which is what Principle V
("Verified Before Done" — must be exercised in a running browser) will actually catch.

**Alternatives considered**: Build the full UI (delete buttons, tag CRUD, funnel chart)
against best-guessed endpoint shapes — rejected; nothing to point the `real` client at,
and it would misrepresent what's shippable this iteration. Waiting on the backend team
before starting any of Epic 5 — rejected; the four user stories are, with the above
scope reductions, fully supported today and there's no reason to block on the
remainder.

## Decision 4 — Client structure follows the existing per-feature mock/real split, one client per admin resource

**Decision**: `src/features/admin/api/` gets one client trio (`<name>Client.ts` /
`.mock.ts` / `.real.ts` / `.types.ts`) per admin resource — `aiModelsClient`,
`taxonomyClient` (categories only, per Decision 3), `templatesAdminClient`,
`dashboardClient` — mirroring the existing `authClient` / `generateClient` split
(each `<name>Client.ts` picks `.mock` or `.real` based on `isApiConfigured()` /
`API_BASE_URL`, per `generateClient.ts`'s pattern).

**Rationale**: Every existing feature in this repo follows this exact split; Epic 5
has four fairly distinct resources (models, taxonomy, templates, analytics) each with
its own request/response shapes, so one client per resource matches the granularity
already established rather than one monolithic `adminClient`.

**Alternatives considered**: A single `adminClient` with namespaced methods
(`adminClient.aiModels.create(...)`) — rejected as a new pattern not used anywhere
else in the codebase; would be the first feature to deviate from the established
one-client-per-domain convention for no clear benefit.

## Decision 5 — Route paths match the BA's documented admin URLs

**Decision**: `/admin/ai-models`, `/admin/taxonomy`, `/admin/templates`,
`/admin/dashboard`, nested under `RootLayout` (shared `TopBar`) and wrapped in
`RequireAdmin`. `TopBar` gains a conditional "Admin" entry point, rendered only when
`session?.isAdmin` is true.

**Rationale**: These are the exact paths named in all four user stories
(`us-5.1`–`us-5.4`) and `agent/BA.md` §2 — no reason to invent different ones. They're
frontend routes, independent of the backend's `/admin/ai-models` etc. REST paths
(which happen to share the same segment names, coincidentally, but are a separate
namespace under `/api/v1`).

**Alternatives considered**: A single `/admin` page with tabs — rejected; the user
stories specify four distinct addressable routes, and deep-linking to e.g.
`/admin/dashboard` directly is implied by "protected admin route at X" language in
each story.

## Decision 6 — Category-name uniqueness is a client-side pre-check; no dedicated conflict error code exists

**Decision**: Per the `/speckit-clarify` session, category names must be rejected as
duplicates (case-insensitive, among siblings under the same parent) at creation. The
contract documents no specific error code for this case (unlike, say, `409 Conflict`
/ `EMAIL_ALREADY_EXISTS` for registration) — `POST /admin/categories`'s only
documented response is `201`. This plan therefore: (a) does a client-side
case-insensitive comparison against the already-loaded category list for the target
parent before submitting, blocking the obviously-duplicate case with an immediate,
specific error, and (b) if the backend independently rejects a duplicate that slipped
past the client-side check (e.g. a race with another Admin), falls back to
`ApiError.message` displayed as a generic error — no code-specific branch is invented
for a case the contract doesn't document.

**Rationale**: Constitution Principle III says the contract supersedes user-story/BA
detail when they disagree, but is silent here on the exact enforcement mechanism —
inventing a specific error code (e.g. `CATEGORY_NAME_TAKEN`) the backend has never
committed to would risk the real client silently mishandling whatever code the
backend actually sends. A client-side pre-check satisfies the clarification's intent
(block obvious duplicates before they reach the network) without depending on
undocumented backend behavior.

**Alternatives considered**: Skip the pre-check and rely entirely on the backend's
response — rejected because a purely reactive check offers no better feedback than
today's default per-request error path, without capturing the clarification's
"reject with a clear error" nuance the client can do proactively for the common case.

## Decision 7 — Concurrent template edits: no additional locking logic required

**Decision**: Per the `/speckit-clarify` session, concurrent edits by different
Admins to the same template use last-write-wins with no conflict warning. This
requires no additional frontend logic beyond what `PATCH /admin/templates/{id}`
already does — the editor simply submits its current form state on save, and the
backend creates a new version from whatever it receives last. No optimistic-locking
token (e.g. an `If-Match`/version header) is sent, since the contract doesn't define
one and the clarification explicitly rejected that behavior (Option A in the
clarification prompt).

**Rationale**: This decision exists purely to record that the "no work needed" outcome
was deliberate, not an oversight — a future contributor re-reading `spec.md`'s FR-014
concurrent-edit clause shouldn't wonder why no locking code was written.

**Alternatives considered**: N/A — the clarification already selected the
no-extra-mechanism option; this decision is the plan-level acknowledgment of that
choice.
