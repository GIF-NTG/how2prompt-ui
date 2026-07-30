# Phase 0 Research: Admin & Content Management

## Decision 1 — `isAdmin` must be added to the session, not just the profile

**Decision**: Extend `Session` (`src/features/auth/api/types.ts`) with `isAdmin: boolean`,
populated from the backend's `UserProfile.isAdmin` field (`docs/api/openapi.yaml`) at
every point a `Session` is constructed (`login`, `signInWithGoogle`, `restoreSession`).
The mock client's `BackendUser`-equivalent fixture gains an `isAdmin` flag too, plus a
second seeded demo account with `isAdmin: true` so the mock flow is testable without a
real backend.

**Rationale**: The existing narrower `UserProfile` type (auth feature, US-1.7 scope)
deliberately omits `isAdmin` — it's the editable-profile subset, not the full backend
schema. But route guarding for Epic 5 needs to know admin status as early as
`isRestoring` resolves, before any admin page ever calls a profile endpoint. The
session is already the thing `AuthProvider` restores on mount and refreshes silently,
so it's the natural place to carry a flag needed for routing decisions, not a
per-page profile fetch.

**Alternatives considered**: A separate `useIsAdmin()` hook that calls `GET /users/me`
on demand — rejected because it would fetch the full profile again (duplicate
network call, already-available data) and introduce a loading-state race with
route guarding on every admin navigation.

## Decision 2 — No `ProtectedRoute`/role-guard component exists yet; build one

**Decision**: Add `RequireAdmin` (`src/features/admin/components/RequireAdmin.tsx`), a
route wrapper that: while `isRestoring`, renders nothing (avoids a flash);
once resolved, redirects to `/login` if `session` is null, redirects to `/` if
`session.isAdmin` is false, and renders `<Outlet />` otherwise.

**Rationale**: `App.tsx` currently has zero route-level authorization — every existing
route is either public or the auth flow itself. Epic 5 is the first feature that needs
a real gate. FR-001/SC-003 require 100% of non-Admin access attempts to be blocked;
that has to be enforced client-side at minimum (route level) even though the backend
is the actual authority.

**Alternatives considered**: Per-page `if (!session?.isAdmin) return <Navigate />`
duplicated in every admin page — rejected as exactly the kind of repeated logic a
shared route wrapper exists to avoid, and easier to get subtly wrong four times than
once.

## Decision 3 — Contract gaps: this implementation ships only what `docs/api/openapi.yaml` documents

**Decision**: Per Constitution Principle III, `docs/api/openapi.yaml` is the
authoritative wire contract and supersedes `agent/BA.md`/user-story detail where they
disagree. Comparing the two surfaced real gaps — this plan scopes the frontend to what
the contract currently exposes, and defers the rest as an explicit backend follow-up
rather than building UI against endpoints that don't exist:

| Spec requirement                                 | Contract support                                                                                                                                                          | Scoping decision                                                                                                                                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-005 (delete an unused AI model)               | No `DELETE /admin/ai-models/{id}` in the contract — only `GET`/`POST /admin/ai-models` and `PATCH /admin/ai-models/{id}`                                                  | Ship create + edit + activate/deactivate (`isActive` via `PATCH`) only. No delete action in the UI; deactivation is the only "remove from selection" affordance, which happens to satisfy FR-004's in-use guard trivially (nothing to block).          |
| FR-006 (delete a category)                       | No `DELETE /admin/categories/{id}` — only `POST`/`PATCH /admin/categories`                                                                                                | Ship create + edit (including re-parenting) only. No delete action in the UI.                                                                                                                                                                          |
| FR-007 (create/edit/delete/merge tags)           | **No admin tag endpoints exist at all** — the contract only has a read-only `Tag` schema (used elsewhere for display), no `POST/PATCH/DELETE` under `/admin/...` for tags | Tag management is out of scope for this implementation. The taxonomy screen ships category management only; a visible "Tag management is not yet available" note replaces the tag CRUD/merge UI. Tracked as a backend follow-up, not silently dropped. |
| FR-015 (signup→first-generate conversion funnel) | `DashboardStats` schema has no funnel field — only `totalUsers`, `dau/wau/mau`, `totalTemplates`, `totalPromptsGenerated`, `promptsToday`, `topTemplates`, `topModels`    | Dashboard ships every field the contract provides; the conversion-funnel metric is omitted until the backend adds it.                                                                                                                                  |

**Rationale**: Building UI against endpoints that don't exist in the one authoritative
contract this repo has would either silently 404 in the real client or require
inventing a shape the backend team hasn't committed to — both violate Principle III.
Scoping down to "what the contract supports today, with the gap named" keeps the
frontend honest about what actually works end-to-end, which is what Principle V
("Verified Before Done" — must be exercised in a running browser) will actually catch.

**Alternatives considered**: Build the full UI (delete buttons, tag CRUD, funnel chart)
against best-guessed endpoint shapes — rejected; nothing to point the `real` client at,
and it would misrepresent what's shippable this iteration. Waiting on the backend team
before starting any of Epic 5 — rejected; three of the four user stories (models,
category-only taxonomy, template authoring/publish, dashboard-minus-funnel) are fully
supported today and there's no reason to block on the remainder.

## Decision 4 — Client structure follows the existing per-feature mock/real split, one client per admin resource

**Decision**: `src/features/admin/api/` gets one client trio (`<name>Client.ts` /
`.mock.ts` / `.real.ts` / `.types.ts`) per admin resource — `aiModelsClient`,
`taxonomyClient` (categories only, per Decision 3), `templatesAdminClient`,
`dashboardClient` — mirroring the existing `authClient` / `templateClient` /
`generateClient` split (`authClient.ts` re-exports whichever of `.mock`/`.real` is
active based on `isApiConfigured()`).

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
