# Quickstart: Validating Admin & Content Management

Prerequisites: `npm install` already run; no real backend required — the mock clients
(`isApiConfigured() === false`, i.e. `VITE_API_BASE_URL` unset) cover every scenario
below, including the already-seeded admin demo account. Start the dev server:

```bash
npm run dev
```

## 1. Access control (FR-001, SC-003)

1. Sign out (or open an incognito tab). Navigate to `/admin/ai-models` directly.
   **Expected**: redirected to `/login`, not a blank/broken page.
2. Sign in as the non-admin mock demo account (`demo@how2prompt.dev` /
   `demo1234`). Navigate to `/admin/dashboard` directly.
   **Expected**: redirected away (e.g. to `/`), no admin UI is briefly visible.
3. Sign in as the mock admin account (`admin@how2prompt.dev` / `admin1234`,
   already seeded in `authClient.mock.ts`).
   **Expected**: an "Admin" entry appears in the top bar; all four `/admin/*` routes
   render their real content.

## 2. AI model catalog (User Story 1 — FR-002, FR-003, FR-004)

1. As Admin, go to `/admin/ai-models`. Create a model (`code`, `name`, `provider`,
   `modelType` at minimum).
   **Expected**: appears in the list immediately.
2. Open the template-generation flow for any template and check its model dropdown.
   **Expected**: the new model is selectable there without a page reload elsewhere.
3. Edit the model's `isActive` toggle off.
   **Expected**: it disappears from the public model dropdown but remains listed
   (as inactive) on `/admin/ai-models`.
4. Attempt to find a delete action for a model already referenced by a template.
   **Expected**: no delete action is offered at all (FR-004a) — deactivation is the
   only removal affordance.

## 3. Taxonomy (User Story 2 — FR-006, FR-007, FR-007a, FR-008)

1. As Admin, go to `/admin/taxonomy`. Create a top-level category, then create a
   second category with the first as its parent.
   **Expected**: the tree view shows correct nesting.
2. Try creating a category with the same name (any case) as an existing sibling
   under the same parent.
   **Expected**: creation is rejected with a clear error before any network call
   (spec.md Clarifications; research.md Decision 6).
3. Go to the public catalog's filter controls.
   **Expected**: the new categories appear there.
4. Look for tag creation/edit/merge controls on `/admin/taxonomy`.
   **Expected**: existing tags are listed read-only; a visible note explains tag
   management isn't available yet (FR-007a) — no broken or silently missing control.

## 4. Template authoring & publish (User Story 3 — FR-009 through FR-014)

1. As Admin (with at least one model and category already created above), go to
   `/admin/templates`. Start a new template: title/description, prompt body
   containing `{{topic}}`, but declare no variable for it yet. Try to publish.
   **Expected**: publish is blocked, and the missing `topic` placeholder is
   identified in the error.
2. Add a `topic` variable matching the placeholder. Select an existing tag from the
   tag picker (no free-text tag creation should be possible). Save as draft, then
   publish.
   **Expected**: publish succeeds; the template is now visible on the public
   `/` (catalog) as an official template.
3. Edit the now-published template's prompt body.
   **Expected**: the save creates a new version rather than silently overwriting —
   verify via whatever version indicator the UI exposes (e.g. version number
   incrementing).
4. Simulate a concurrent edit: open the same published template in two tabs as
   Admin, change the prompt body differently in each, save tab A then save tab B.
   **Expected**: tab B's save wins (creates the version reflecting tab B's edit);
   no conflict warning is shown to either tab (spec.md Clarifications; research.md
   Decision 7).

## 5. Analytics dashboard (User Story 4 — FR-015, FR-015a, FR-016)

1. As Admin, go to `/admin/dashboard`.
   **Expected**: DAU/WAU/MAU, prompts-generated-over-time, top templates, and top
   models all render with data (mock client should return non-empty fixtures).
2. Apply a custom date range.
   **Expected**: the displayed figures change to reflect the selected range (mock
   client may simply vary its fixture output based on the range, not require a real
   aggregation engine).
3. Confirm no conversion-funnel widget is present (FR-015a — not yet in the
   contract).

## Automated checks

Before calling any of the above "done", per Constitution Principle V:

```bash
npm run lint
npx tsc -b && npm run build
npm run test
```

All three must pass, in addition to the manual browser walkthrough above — a passing
type-check alone does not confirm the dynamic taxonomy tree, placeholder validation,
tag read-only enforcement, or dashboard date filter actually behave correctly at
runtime.
