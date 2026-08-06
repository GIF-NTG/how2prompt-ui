# Phase 0 Research: Translate App Text to English

No `NEEDS CLARIFICATION` markers exist in `spec.md`'s Technical Context — this
feature reuses the existing stack and introduces no new dependency. The
decisions below record the approach chosen for identifying and translating the
remaining Vietnamese strings.

## Decision: Identify strings via Unicode-range scan, not manual screen review alone

**Rationale**: Grepping `src/` for Vietnamese-only diacritic characters
(`[À-ỹ]` Unicode range) surfaces every hardcoded Vietnamese string, including
ones a manual screen walkthrough would miss (e.g. `aria-label`s, toast/error
messages only shown on specific error codes, mock-data fields never exercised
by a quick click-through). This scan already found 96 matching files during
spec authoring and is the basis for scoping tasks per feature area.

**Alternatives considered**: Manual screen-by-screen review only — rejected,
too easy to miss conditional/error-path strings and `aria-label`s that aren't
visually rendered.

## Decision: No i18n framework is introduced

**Rationale**: The app currently has no localization layer — English and
Vietnamese strings are both hardcoded directly in JSX/TSX. Introducing
`react-i18next` or similar would be a structural change well beyond "translate
existing text," and nothing in the spec asks for runtime language switching.

**Alternatives considered**: Adding an i18n library and translation JSON files
— rejected as out of scope (see spec Assumptions); would also require a
follow-up spec of its own per Constitution Principle II (Spec-Before-Code).

## Decision: Translate UI-visible mock API client data, not just static JSX text

**Rationale**: `*.mock.ts` files under each feature's `api/` folder (e.g.
`templateClient.mock.ts`, `historyClient.mock.ts`, `dashboardClient.mock.ts`)
supply the content rendered on-screen in local/dev builds. Leaving their
Vietnamese strings untouched would mean the catalog, detail, history, and
admin screens still show Vietnamese text at runtime even after all JSX/TSX
literals are translated.

**Alternatives considered**: Leaving mock data as-is — rejected, fails spec
SC-003 (manual walkthrough of every screen must show only English).

## Decision: Update test files in the same change as their subject component/mock

**Rationale**: Several `*.test.tsx` files assert on the literal Vietnamese
strings currently rendered (e.g. `getByText('Chính thức')`). Translating the
component without updating its test would break that test; translating the
test without the component would make the test falsely pass against the old
string. Keeping both edits together per feature area keeps `vitest` green
throughout implementation (Constitution Principle V).

**Alternatives considered**: Translating all components first, then sweeping
tests afterward — rejected, leaves the suite red for an extended window and
risks an incomplete second pass.

## Decision: Fix `getI18nValue`'s locale preference before translating I18nString-backed content

**Rationale**: `src/shared/utils/i18n.ts`'s `getI18nValue(obj, locale = 'vi')` always
returns `obj.vi` when present, regardless of the `locale` argument
(`if (locale === 'vi' && obj.vi) return obj.vi; return obj.vi ?? obj.en ?? ''`), and
every call site (`TemplateCard.tsx`, `TemplateHero.tsx`, `FilterPopover.tsx`,
`DashboardMetrics.tsx`) calls it with no locale argument at all. This function — not
a hardcoded string — is what renders Vietnamese template/category names,
descriptions, and dashboard "popular template" titles on the P1 catalog/detail
screens and the P3 admin dashboard. It has no Vietnamese diacritics itself, so the
Unicode-scan method (see the first Decision above) cannot find it; it must be fixed
as its own foundational step, before or alongside the per-file tasks that touch
`I18nString`-typed data (mock fixtures, `historyClient.real.ts`'s `templateTitle`
mapping).

**Fix**: Change `getI18nValue` to prefer `en` unconditionally (drop the `locale`
parameter's `'vi'`-preferring branch, or change the default/preference to `'en'`).
Leave existing `I18nString.vi` field values as inert legacy data — do not spend
effort translating or blanking `vi` fields in mock/real-mapping files, since they
will no longer be read once the picker prefers `en`.

**Alternatives considered**: Editing every `vi:` field's text to English in each
mock/real file — rejected, because the picker still reads `.vi` first, so this
would just duplicate the `en` value into `vi` at dozens of call sites for no
behavioral difference, and risks the two fields drifting in wording over time.

**Related**: `src/features/template-generate/components/FormField.tsx` has a
second, independent locale picker (`getLocalizedText`) that already resolves to
`.en` in practice (its `locale` prop is never passed by `DynamicForm.tsx`, so it's
always `undefined`, which fails the `=== 'vi'` check). No fix needed there — noted
here only so the two mechanisms aren't confused during implementation.

## Decision: Group implementation by feature directory, following spec priority order

**Rationale**: The spec's three user stories already partition the app by
priority (P1 home/catalog/detail/generate, P2 auth, P3 history/favorites +
admin). Working feature-directory by feature-directory keeps each unit
independently verifiable (lint/build/test/manual walkthrough) before moving
to the next, matching how the spec's Independent Test sections are written.

**Alternatives considered**: A single sweeping find-and-replace across the
whole repo in one pass — rejected, higher risk of mistranslating
context-dependent phrases (e.g. a word that reads differently as a button
label vs. a status badge) without per-screen verification.
