# Quickstart: Validate the field-casing fix

## Prerequisites

- Node deps installed (`npm install`).
- No real backend required — the mock client is sufficient to prove no regression;
  a hand-shaped camelCase fixture proves the real-backend fix (see below).

## 1. Regression check against the mock client (no behavior change)

```bash
npm run test        # vitest — templateClient.mock.test.ts, CatalogPage.test.tsx, etc.
npm run lint         # oxlint
npm run build        # tsc -b && vite build
```

Expected: all pass, with test assertions updated to camelCase field names (per
`data-model.md`) but otherwise unchanged behavior/values.

```bash
npm run dev
```

- Open the catalog page: cards must show the same cover images, official badges,
  usage/favorite counts, and dates as before the change.
- Open a template detail page: hero, meta panel, usage guide, and example output must
  render identically to before the change.
- Toggle a favorite: heart state and count must update as before.

## 2. Prove the real-contract bug is fixed

Since there's no live backend in this repo, simulate a real API response shaped
exactly per `docs/api/openapi.yaml` (camelCase) and confirm the UI reads it correctly
end-to-end — this is the scenario that was broken before this fix (every field
resolved to `undefined`).

1. Temporarily stub `templateClient.real.ts`'s `getTemplates`/`getFeatured` (or add a
   throwaway test) to return a fixture object using only camelCase keys, e.g.:
   ```ts
   {
     id: '...', slug: 'demo', title: { en: 'Demo' }, description: { en: '...' },
     coverImage: '/img.png', isOfficial: true,
     author: { id: '...', fullName: 'Jane Doe', username: 'jane', avatarUrl: null, type: 'user' },
     categories: [{ id: '...', slug: 'writing', name: { en: 'Writing' }, description: { en: '' },
                    icon: null, color: null, parentId: null, sortOrder: 0, templateCount: 3 }],
     tags: [{ id: '...', slug: 'seo', name: 'SEO', usageCount: 5 }],
     supportedModels: ['gpt-4o'],
     usageCount: 120, favoriteCount: 8, isFavorited: false, createdAt: '2026-07-01T00:00:00Z',
   }
   ```
2. Render `TemplateCard` (or the catalog page) with this fixture.
3. Confirm every field renders the fixture's value — not blank/undefined.
4. Remove the temporary stub/test once confirmed (or keep it as a permanent
   regression test if useful — optional, not required by this feature).

## 3. Field-by-field sanity check

Cross-reference `data-model.md`'s mapping tables against:

- `src/features/home/types.ts`, `src/features/template-detail/types.ts`
- `templateClient.real.ts`, `templateDetailClient.real.ts`
- `templateClient.mock.ts`, `templateDetailClient.mock.ts`
- `TemplateCard.tsx`, `TemplateHero.tsx`, `TemplateMeta.tsx`, `TemplateDetailPage.tsx`,
  `CatalogPage.tsx`, `ModelTags.tsx`, `TagFilterChips.tsx`, `CategoryFilterChips.tsx`

No occurrence of the old snake_case names (`prompt_body`, `is_official`,
`usage_count`, `created_at`, `cover_image`, `favorite_count`, `view_count`,
`full_name`, `avatar_url`, `parent_id`, `sort_order`, `template_count`, `model_type`,
`icon_url`, `is_active`, `is_favorited`, `supported_models` [snake variant],
`current_version`, `example_output`) should remain, except the two documented
exceptions in `data-model.md`'s "Explicitly NOT renamed" section.
