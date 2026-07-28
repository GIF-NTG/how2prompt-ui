# Research: Home — Template Catalog

**Feature**: `specs/004-home-catalog-browse`
**Date**: 2026-07-27

## R1: How to move httpClient.ts to shared without breaking auth imports

**Decision**: Move `src/features/auth/api/httpClient.ts` to `src/shared/utils/httpClient.ts`
and update all imports in `features/auth/api/*.ts` to use `@/shared/utils/httpClient`.

**Rationale**: The `httpClient.ts` provides `apiFetch<T>()` and `ApiError` — both
general-purpose HTTP primitives that the new `templateClient.real.ts` needs. Keeping it
under `features/auth/` would force the home feature to import from another feature's
internal directory, violating the feature-first architecture.

**Alternatives considered**:

- Creating a duplicate httpClient in `features/home/api/`: rejected (DRY violation, two
  clients to maintain).
- Keeping httpClient in auth and importing cross-feature: rejected (violates feature
  isolation).

## R2: How to handle URL query string sync for filters

**Decision**: Create a custom hook `useCatalogFilters` that reads/writes URL search
params via React Router's `useSearchParams`. The hook owns the filter state (tag, model,
search query) and provides `setFilters` / `setSearch` / `setModel` / `setTag` helpers
that update both local state and the URL atomically.

**Rationale**: Deep-linking is a hard requirement (FR-013, SC-004). React Router's
`useSearchParams` is the idiomatic way to sync component state with URL query strings
in this stack. It handles encoding/decoding automatically and triggers re-renders on
URL changes (e.g., browser back/forward).

**Alternatives considered**:

- Manual `window.history.pushState` + `popstate` listener: rejected (fragile, misses
  React Router's context).
- Storing filters only in component state: rejected (breaks deep-linking requirement).

## R3: How to implement debounced search

**Decision**: Create a generic `useDebounce<T>(value, delay)` hook in `shared/hooks/`.
The `FilterBar` component passes the raw search input to `useDebounce(value, 300)` and
uses the debounced value for the API call / filter logic.

**Rationale**: The 300ms debounce is a standard UX pattern for search inputs. A generic
hook avoids coupling the debounce logic to any specific feature. The hook uses
`useState` + `useEffect` with a `setTimeout`/`clearTimeout` pair — no external
dependency needed.

**Alternatives considered**:

- Using lodash.debounce: rejected (adds a dependency for a 10-line utility).
- Debouncing at the API client level: rejected (the debounce is a UI concern, not an
  API concern).

## R4: How to structure the template client (mock vs. real)

**Decision**: Follow the existing auth pattern — a `TemplateClient` interface in
`templateClient.types.ts`, a factory in `templateClient.ts` that picks mock or real
based on `VITE_API_BASE_URL`, and separate mock/real implementations.

**Rationale**: This is the established convention in the codebase (see
`features/auth/api/authClient.ts`). It allows the catalog to be fully functional with
mock data before the backend is ready, and switching to the real API requires only
setting `VITE_API_BASE_URL`.

**Alternatives considered**:

- Using a single client with conditional fetch calls: rejected (harder to test, mixes
  concerns).
- Using MSW (Mock Service Worker) for API mocking: rejected (adds a dev dependency,
  the existing pattern works).

## R5: How to render the TopBar consistently across pages

**Decision**: Extract the top bar into `shared/components/TopBar.tsx` and render it
inside `RootLayout.tsx`. The `TopBar` reads auth state via `useAuth()` to decide
whether to show the user chip or guest link.

**Rationale**: The top bar is shared across all app views (catalog, template detail,
history). It belongs in the app shell (`RootLayout`), not in any single feature. The
current `RootLayout` has a minimal session display; this upgrade brings it to match the
mockup's full top bar (brand mark, nav links, user chip).

**Alternatives considered**:

- Keeping the top bar in each page component: rejected (duplication, inconsistent nav
  state).
- Creating a new layout wrapper per page group: rejected (over-engineering for a
  single-level nav).

## R6: How to handle i18n fields from the API

**Decision**: Use a `getI18nValue(obj: I18nString, locale?: string): string` utility
function in `shared/utils/` that reads `obj.vi ?? obj.en ?? ''`. The locale defaults
to `'vi'` (the app's primary language per the mockup) with English fallback.

**Rationale**: The API returns `I18nString` (`{ "en": "...", "vi": "..." }`) for
template titles, descriptions, tag names, and category names. All displayed copy in
the mockup is Vietnamese. A single utility function avoids scattering locale logic
across components.

**Alternatives considered**:

- Using an i18n library (react-intl, i18next): rejected (overkill for a single-language
  app with a simple fallback).
- Hardcoding `.vi` access: rejected (would break if a field has no Vietnamese
  translation).
