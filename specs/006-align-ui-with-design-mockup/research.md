# Phase 0 Research: Align Current UI With Approved Design Mockup

The feature spec has no `[NEEDS CLARIFICATION]` markers, so this phase is a
concrete visual audit — comparing every in-scope component's current Tailwind
classes against the CSS in `docs/design/how2prompt-workspace-mockup.html` — rather
than open-ended technology research. Each finding below is a **Decision** the
implementation (Phase 2 tasks) must apply.

## Design token table (source of truth)

Extracted from the mockup's `:root` / `:root[data-theme='dark']` blocks
(`docs/design/how2prompt-workspace-mockup.html` lines 8–47). These are the only
colors any restyled element may resolve to.

| Token           | Light     | Dark      |
| --------------- | --------- | --------- |
| `--bg`          | `#f3f5f0` | `#14171a` |
| `--surface`     | `#ffffff` | `#1c2024` |
| `--surface-2`   | `#eaede6` | `#23282c` |
| `--ink`         | `#1b1d1b` | `#eceee8` |
| `--ink-soft`    | `#5b5f58` | `#a2a79c` |
| `--ink-faint`   | `#8b8f86` | `#6d726a` |
| `--accent`      | `#3652e0` | `#8493ff` |
| `--accent-ink`  | `#ffffff` | `#14171a` |
| `--accent-soft` | `#e7eafc` | `#262c4a` |
| `--line`        | `#dbdfd3` | `#2c3130` |
| `--danger`      | `#c23a2e` | `#ff7a6b` |
| `--danger-soft` | `#fbe7e4` | `#3a2224` |
| `--focus`       | `#3652e0` | `#8493ff` |

`--font-sans`: system sans stack. `--font-mono`: system mono stack, reserved for
placeholder/template-token content, badges, meta labels, and link-style buttons
(`.back-link`, `.link-btn`, `.guest-link` typography convention) — per
`docs/design/README.md` and the Constitution's Development Workflow guidance.

## Decision: keep inline Tailwind arbitrary values, no CSS variable layer

**Decision**: Continue expressing every color as an inline Tailwind arbitrary
value (e.g. `bg-[#1B1D1B]`, `dark:bg-[#ECEEE8]`) copied from the token table
above, exactly like the existing `TopBar.tsx` and `src/features/auth` components
already do. Do not introduce `:root` CSS custom properties or a Tailwind theme
extension.

**Rationale**: `src/index.css` has no theme layer today (`@import 'tailwindcss'`
only); every existing screen already hardcodes the mockup's hex values inline.
Introducing a token/variable indirection would be a styling-architecture change
unrelated to this feature's presentation-only scope, and the Constitution's
Development Workflow guidance says to reuse the already-approved tokens, not
restructure how they're delivered.

**Alternatives considered**: Add Tailwind `@theme` custom properties mirroring
the mockup's `:root` block — rejected as scope creep; worth proposing separately
if hex-value duplication becomes a real maintenance problem.

## Decision: confirmed styling drift to fix

Audited every in-scope component's current classes against the mockup's CSS
rules for the equivalent element. Confirmed drift (must fix):

1. **Official-template badge case** (`TemplateCard.tsx`, `TemplateHero.tsx`) —
   both apply Tailwind's `uppercase` to the "Chính thức" badge. The mockup's
   `.badge-official` rule (line 822) sets no `text-transform`, so "Chính thức"
   renders in its natural case. Remove `uppercase` from both.
2. **Danger/favorite color hex typo** (`TemplateCard.tsx`, `TemplateMeta.tsx`) —
   both use `#C23A2A` for the light-theme danger/favorite-active color. The
   mockup's `--danger` token (line 19) is `#c23a2e`. Fix the light-theme hex in
   both components; the dark-theme value (`#FF7A6B`) already matches
   `--danger` dark exactly.
3. **Nav link hover state** (`TopBar.tsx`) — the mockup's `.app-nav a:hover`
   rule (line 183) applies `border-color: var(--ink-faint)` on hover, same as
   the active/current-page state. The current `Link` classes only change text
   color on hover (`hover:text-[#1B1D1B]`) with no border-bottom, and the
   active-state border color (`border-b-[#8B8F86]`) has no dark-mode override
   (should be `#6D726A`, `--ink-faint` dark, in dark theme). Add a hover
   border-bottom using `--ink-faint` (light `#8B8F86` / dark `#6D726A`) and add
   the missing `dark:border-b-[#6D726A]` to the active state.
4. **`BackLink.tsx` typography** — the mockup's `.back-link` rule (line 905) is
   `font-family: var(--font-mono)`, `font-size: 0.8rem`, underlined
   (`text-decoration: underline`), color `--ink-soft` → `--ink` on hover. The
   current component renders sans-serif, non-monospace, non-underlined text at
   `0.85rem`. Switch to `font-mono`, add `underline underline-offset-2`, and
   use `text-[0.8rem]`.
5. **Output/guide card geometry** (`UsageGuide.tsx`, `ExampleOutput.tsx`) — the
   mockup's closest equivalent boxed-content container, `.output-box` (line
   1114), uses `border-radius: 14px` and `padding: 1.1rem 1.2rem`. The current
   components use `rounded-[10px]` and `p-5` (`1.25rem` all sides). Align to
   `rounded-[14px]` and `p-[1.1rem_1.2rem]` to match every other card
   (`.template-card` also uses 14px/1.1rem–1.2rem) for a consistent card
   language across the app.
6. **`TemplateMeta.tsx` usage-count size** — the mockup's `.usage-count` rule
   (line 891) is `font-size: 0.7rem`; the current component uses `0.78rem`.
   Align to `text-[0.7rem]` (color/family already match `--ink-faint`/mono
   exactly).

No other confirmed drift: `TemplateCard`'s card geometry (radius, padding, hover
translateY/shadow), `search-box`, `filter chips`, `model-select`, `rail`/`grid`
spacing, `model-tag` pills (`ModelTags.tsx`), and `TemplateHero`'s hero
title/description typography already match the mockup's tokens and values
exactly.

## Decision: how to handle mockup coverage gaps

Two in-scope areas have no literal 1:1 element in the mockup to copy from:

1. **Template Detail's "Hướng dẫn sử dụng" (usage guide) and "Ví dụ kết quả"
   (example output) sections.** The mockup's only template-detail-shaped screen
   (`#pageTemplate`, lines 1610–1671) is actually the combined
   detail-plus-dynamic-generate-form screen for Epic 3 (not yet built in
   `src/features`); it has no read-only guide/example cards at all — those are
   unique to the already-shipped `005-view-template-details` feature.
   **Decision**: keep these as boxed content cards using the mockup's general
   `.output-box` token treatment (surface background, `--line` border, 14px
   radius — see drift item 5 above) rather than inventing a new visual
   language or blocking on a mockup redesign. This follows the spec's
   Assumptions section ("nearest existing pattern... rather than introducing a
   new visual language").
2. **Guest-state top navigation bar.** The mockup's app-shell topbar markup
   (lines 1533–1547) only ever renders the signed-in `.user-chip` — there is no
   guest branch in the workspace view (the mockup's guest-only affordance,
   `.guest-link`, appears solely on the pre-login auth screen). **Decision**:
   keep the existing guest "Đăng nhập" link's typography convention (mono,
   small size, underline — modeled on `.link-btn`) since it already follows the
   mockup's link-button convention; no literal element to diff against, no
   further change needed beyond the shared nav-link hover fix in drift item 3.

## Data model

N/A — this feature adds, removes, or renames no entity, field, or type. All
existing `TemplateListItem`, `TemplateDetail`, and auth `Session` shapes are
unchanged (FR-007).

## External interfaces / contracts

N/A — no API, CLI, or other external interface is added or changed. All
existing `templateClient` / `templateDetailClient` / `authClient` calls and
their error handling are unchanged (FR-007).
