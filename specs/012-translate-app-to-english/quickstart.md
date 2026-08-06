# Quickstart: Validate Translate App Text to English

No new contracts are introduced by this feature (see `plan.md` — content-only
change, no API/interface surface), so this guide validates the translation
directly: no remaining Vietnamese text, no regressions, matching
`spec.md`'s Success Criteria.

## Prerequisites

- Dependencies installed: `npm install` (if not already).
- Working tree includes the translated files for the feature area(s) being
  validated.

## 1. Automated scan for leftover Vietnamese text (SC-001)

Run from the repo root:

```bash
grep -rlP '[À-ỹ]' src/
```

Expected: no output (empty result). Any file listed still has Vietnamese
characters and the corresponding user story in `spec.md` is not yet done.

## 2. Test suite (SC-002)

```bash
npm run test
```

Expected: full pass, with no test asserting on the old Vietnamese strings
(cross-check via the same grep against `src/**/*.test.tsx` specifically if any
failures reference removed text).

## 3. Lint and build (Constitution Principle V)

```bash
npm run lint
npm run build
```

Expected: both succeed with no new errors/warnings introduced by the text
changes.

## 4. Manual screen walkthrough (SC-003)

```bash
npm run dev
```

Walk through each screen listed in `spec.md`'s user stories and confirm every
state (default, loading, empty, error, success) shows English text only:

- **P1**: home/catalog page → a template card's badges/usage count/favorite
  button → template detail page (including reload-unavailable and
  newer-version banners) → the generate form (fields, validation, live
  preview, actions).
- **P2**: login, register, forgot password, reset password, verify email
  (banner + page), profile settings — trigger at least one validation error
  and one success state on each.
- **P3**: history page (filters, reload, delete confirmation, empty state),
  favorites page, and each admin page (AI models, taxonomy, templates,
  dashboard) — trigger a CRUD dialog and check chart/table labels.

Expected: no Vietnamese text in any state reached during the walkthrough.
