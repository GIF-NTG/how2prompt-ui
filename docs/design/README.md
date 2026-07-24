# Design references

`how2prompt-workspace-mockup.html` is a self-contained, clickable HTML mockup of the
approved visual direction for How2Prompt. Open it directly in a browser — no build
step needed.

It covers:
- Login / Register (the screens actually implemented in `src/features/auth`)
- Post-login workspace: template catalog with search/tag filtering, a Variable
  Canvas-style inline-blank prompt editor, a full History page (view/edit/copy/delete),
  and a form for creating/editing your own custom templates

## Why this exists

This is the reference an agent (or a human) should check before building or
restyling any screen in this app, so the result matches what was already designed
and approved instead of re-deriving a look from scratch. Treat it as the source of
truth for:
- **Color tokens** (`:root` custom properties — cool paper neutrals, indigo accent,
  full light/dark support via `prefers-color-scheme` and a `data-theme` override)
- **Typography** (system sans for body/headings, monospace reserved specifically for
  anything placeholder/template-related — pills, tags, the `{field}` motif)
- **The core interaction pattern**: every fill-in-the-blank surface (auth forms, the
  prompt editor) uses the same inline auto-resizing blank, not boxed inputs — see the
  `blank-input` class and the `resize()`/`wireAutoResize()` functions

## Status vs. the real app

The Login/Register screens here match `src/features/auth` closely (same tokens, same
inline-blank pattern, same copy). The catalog/editor/history/custom-template screens
are **design-only** — nothing under `src/features` implements them yet. When that
work starts (see "next screen" discussion — Epic 1's Home + Variable Canvas), use
this file as the reference, not a reason to skip `/speckit-specify` → `/speckit-plan`
→ `/speckit-tasks` for that feature.

This file is plain HTML/CSS/JS with inline demo logic (e.g. a hardcoded
`demo@how2prompt.dev` / `demo1234` login, in-memory template/history arrays) — it is
not real application code and must not be imported into `src/`.
