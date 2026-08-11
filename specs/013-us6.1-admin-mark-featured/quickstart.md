# Quickstart: Admin Mark Template as Featured

## Prerequisites

- `npm install` already run.
- A local `.env` pointing the app at either the mock or real API client (see
  existing project setup — no new env var is introduced by this feature).

## Run

```bash
npm run dev
```

## Validate User Story 1 & 2 (mark / unmark Featured)

1. Log in as the seeded admin account (`admin@how2prompt.dev` / `admin1234`, or
   the real backend's admin credentials).
2. Navigate to `/admin/templates`.
3. Click **Edit** on any template to open `TemplateEditorForm`.
4. Toggle **Featured** on, then **Save Draft**.
5. Confirm the modal closes without error and the admin list shows a "Featured"
   badge next to that template's row (User Story 3 / FR-005).
6. Open the public homepage (`/`) as a Guest (no login) and confirm the template
   now appears in the Featured carousel (`FeaturedTemplateHero` / Featured section
   on `CatalogPage`).
7. Return to `/admin/templates`, edit the same template, toggle **Featured** off,
   save.
8. Reload the homepage and confirm the template no longer appears in the Featured
   carousel.

## Validate edge cases

- Feature a `draft` (unpublished) template: the save should still succeed and the
  admin badge should show, but the template should NOT appear on the public
  homepage carousel until it is published (matches existing draft-visibility
  behavior for every other public listing).
- Reload the admin template list after featuring a template as one Admin, then view
  it as a second Admin session (or a second browser) — the Featured badge should
  already reflect the change with no manual cache clear.

## Automated checks

```bash
npm run lint
npm run build
npm run test
```

Extend `src/features/admin/pages/TemplatesAdminPage.test.tsx` and/or add coverage
in `TemplateEditorForm`'s test file (if one exists, otherwise add one following the
existing mocked-client pattern) for:
- Toggling Featured and saving sends `isFeatured: true` in the update payload.
- The admin list renders a Featured badge when `AdminTemplate.isFeatured` is `true`
  and omits it when `false`.

Refer to [data-model.md](./data-model.md) for the field shape and
[contracts/admin-templates-featured.md](./contracts/admin-templates-featured.md)
for the exact request/response fields — this guide intentionally does not restate
full implementation code.
