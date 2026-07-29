# Quickstart: Validating Admin & Content Management

Prerequisites: `npm install` already run; no real backend required — the mock clients
(`isApiConfigured() === false`, i.e. `VITE_API_BASE_URL` unset) cover every scenario
below. Start the dev server:

```bash
npm run dev
```

## 1. Access control (FR-001, SC-003)

1. Sign out (or open an incognito tab). Navigate to `/admin/ai-models` directly.
   **Expected**: redirected to `/login`, not a blank/broken page.
2. Sign in as the non-admin mock demo account (`demo@how2prompt.dev` /
   `demo1234`). Navigate to `/admin/dashboard` directly.
   **Expected**: redirected away (e.g. to `/`), no admin UI is briefly visible.
3. Sign in as the mock admin account (seeded per `research.md` Decision 1).
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
   **Expected**: no delete action is offered at all (research.md Decision 3) —
   deactivation is the only removal affordance.

## 3. Taxonomy (User Story 2 — FR-006, FR-008)

1. As Admin, go to `/admin/taxonomy`. Create a top-level category, then create a
   second category with the first as its parent.
   **Expected**: the tree view shows correct nesting.
2. Go to the public catalog's filter controls.
   **Expected**: both categories appear there.
3. Look for tag creation/merge controls on `/admin/taxonomy`.
   **Expected**: a visible note that tag management isn't available yet, not a
   broken or silently missing control (research.md Decision 3).

## 4. Template authoring & publish (User Story 3 — FR-009 through FR-014)

1. As Admin (with at least one model and category already created above), go to
   `/admin/templates`. Start a new template: title/description, prompt body
   containing `{{topic}}`, but declare no variable for it yet. Try to publish.
   **Expected**: publish is blocked, and the missing `topic` placeholder is
   identified in the error.
2. Add a `topic` variable matching the placeholder. Save as draft, then publish.
   **Expected**: publish succeeds; the template is now visible on the public
   `/` (catalog) as an official template.
3. Edit the now-published template's prompt body.
   **Expected**: the save creates a new version rather than silently overwriting —
   verify via whatever version indicator the UI exposes (e.g. version number
   incrementing).
4. As a non-admin User, generate a prompt from a still-`v1` history item of that
   template (if history/versioning UI surfaces this) — informational only, not a
   hard gate for this quickstart.

## 5. Analytics dashboard (User Story 4 — FR-015, FR-016)

1. As Admin, go to `/admin/dashboard`.
   **Expected**: DAU/WAU/MAU, prompts-generated-over-time, top templates, and top
   models all render with data (mock client should return non-empty fixtures).
2. Apply a custom date range.
   **Expected**: the displayed figures change to reflect the selected range (mock
   client may simply vary its fixture output based on the range, not require a real
   aggregation engine).
3. Confirm no conversion-funnel widget is present (research.md Decision 3 — not yet
   in the contract).

## Automated checks

Before calling any of the above "done", per Constitution Principle V:

```bash
npm run lint
npx tsc -b && npm run build
npm run test
```

All three must pass, in addition to the manual browser walkthrough above — a passing
type-check alone does not confirm the dynamic taxonomy tree, placeholder validation,
or dashboard date filter actually behave correctly at runtime.
