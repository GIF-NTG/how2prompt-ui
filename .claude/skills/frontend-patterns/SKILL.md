---
name: frontend-patterns
description: Use when implementing a new React feature in how2prompt-ui — a new page, a data-fetching hook, a form, a Zustand store. Trigger phrases include "implement this feature in the frontend", "add a new page for X", "wire up X in React".
---

## Overview

Reusable React patterns specific to how2prompt-ui's architecture (React 18+, TS,
Zustand, React Query, i18next, Tailwind v4, Bulletproof-React-style feature folders) —
see `.claude/rules/typescript/guidelines.md` for the full rule set this skill applies.

## Patterns

### Server state vs. client state

Any data that comes from the backend goes through React Query — never mirror it into
Zustand or component state "for convenience." Zustand is for genuinely client-only
state (UI toggles, multi-step form progress, ephemeral selections).

### Feature folder structure

New features live under `features/<name>/` with their own components, hooks, and
API-call functions colocated — not scattered across top-level `components/`, `hooks/`,
`api/` folders split by file type.

### Dynamic form rendering (per SRS §3, US-3.1-3.6)

Template-driven forms render from a `template_variables` schema (type, validation,
options) — the renderer is generic and driven by data, not a hardcoded form per
template. Client-side preview is UX-only; the backend always re-renders and is the
source of truth for the final generated prompt.

### i18n-first

Every user-facing string goes through i18next from the start, not added as a
follow-up pass — retrofitting i18n after hardcoding strings is expensive.

## Process

1. Check whether an existing hook/component already covers most of the need before
   creating a new one.
2. Write the failing test first (see `.claude/agents/tdd-guide.md`) for
   utilities/hooks; for highly visual components, prioritize visual/behavioral
   verification over brittle markup assertions.
3. Implement following the patterns above.
4. Run `typescript-reviewer`.

## Output

Implementation following the patterns above, with server state in React Query, i18n
keys added (not hardcoded strings), and tests for non-trivial logic.
