# Design references

`how2prompt-workspace-mockup.html` is a self-contained, clickable HTML mockup of the
approved visual direction for How2Prompt, updated for the SRS v2.0 restructure. Open
it directly in a browser — no build step needed.

It covers:

- Login / Register / Forgot password / Reset password (the screens implemented in
  `src/features/auth`, including `001-us1.5-forgot-reset-password`)
- Post-login workspace, redrawn to match `how2prompt-agentic/agent/BA.md` (not the
  old pill/canvas interaction — see "Status vs. the real app" below):
  - **Catalog** (Epic 2): search, category/tag chips, AI-model filter, Featured and
    Trending rails, template grid with a favorite toggle
  - **Template detail + generate** (Epic 3): a **dynamic form** built per
    `template_variables` — one control per `input_type` (`text`, `textarea`,
    `select`, `multiselect` as toggle-chips, `boolean` as a switch, `slider`), a
    live client-side preview pane, an optional "additional instructions" field, and
    Generate & Copy
  - **History** (Epic 4): reload/copy/delete a past generated prompt

## Why this exists

This is the reference an agent (or a human) should check before building or
restyling any screen in this app, so the result matches what was already designed
and approved instead of re-deriving a look from scratch. Treat it as the source of
truth for:

- **Color tokens** (`:root` custom properties — cool paper neutrals, indigo accent,
  full light/dark support via `prefers-color-scheme` and a `data-theme` override)
- **Typography** (system sans for body/headings, monospace reserved specifically for
  anything placeholder/template-related — pills, tags, the `{field}` motif)
- **Two distinct interaction patterns, scoped to different screens** — don't mix
  them:
  - Auth screens (Login/Register/Forgot/Reset) use the inline auto-resizing
    fill-in-the-blank pattern — see the `blank-input` class. Per
    `.specify/memory/constitution.md` Principle I, this pattern is confined to auth
    screens and MUST NOT be extended to new template-generation/catalog screens.
  - Template-generation screens (catalog, detail, generate form) use standard boxed
    form controls (`.text-input`, `.select-input`, toggle-chips, a slider) driven by
    a template's `template_variables` — see "Dynamic form rendering" in the repo's
    root `CLAUDE.md`.

## Status vs. the real app

The Login/Register/Forgot/Reset screens here match `src/features/auth` closely (same
tokens, same inline-blank pattern for auth, same copy, same error-envelope shape).
The catalog/template-detail/history screens are **design-only** — nothing under
`src/features` implements Epic 2/3/4 yet. When that work starts, use this file as
the visual reference, but still go through `/speckit-specify` → `/speckit-plan` →
`/speckit-tasks` for the real feature (per Constitution Principle II) — don't build
straight from this file's inline JS.

This file is plain HTML/CSS/JS with inline demo logic (e.g. a hardcoded
`demo@how2prompt.dev` / `demo1234` login, in-memory template/history arrays, a
`'expired-token'` sentinel for the reset-password expired-link state) — it is not
real application code and must not be imported into `src/`.
