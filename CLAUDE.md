# CLAUDE.md — how2prompt-ui

Frontend SPA for **How2Prompt**, a keyboard-first web app that trains prompt-writing
skill: users fill inline variable pills inside empty template skeletons (Role /
Context / Constraints) instead of copying pre-written prompts.

Full specs live in the `how2prompt-agentic` submodule — treat these as source of truth,
not this file:
- `how2prompt-agentic/docs/SRS.md` — software requirements spec.
- `how2prompt-agentic/docs/epics.md` — epic/story breakdown with acceptance criteria.
- `how2prompt-agentic/agent/BA.md` — BA spec: persona matrix, BDD acceptance criteria,
  DB JSONB schemas, RFC-7807 error catalog, auto-resize-input calculation.
- `how2prompt-agentic/docs/user-stories/*.md` — one file per story, most detailed level.

## Product shape

- **Personas**: Guest (unauthenticated), Member (authenticated), Team Lead
  (authenticated admin, manages shared team variables).
- **Epic 1 — Keyboard-First Prompt Creation Workspace**: command palette (`Ctrl+K`,
  fuzzy search, <50ms filter), inline Variable Canvas (`Tab`/`Shift+Tab` cycles pills,
  pills auto-resize to typed width), localStorage draft backup per template UUID,
  compiler + copy (`Ctrl+Enter`, blocks on empty required pills with red highlight +
  autofocus, 2s "Copied!" toast).
- **Epic 2 — Authentication & Context Configurations**: register/login (email +
  username + password, BCrypt hash, JWT 7-day expiry), JWT persisted in `localStorage`
  + `AuthContext`, Axios interceptor attaches `Authorization: Bearer <token>` and
  redirects to `/login` on 401, Team Lead–only shared team variables
  (`PUT /api/v1/users/me/variables`, JSONB, pre-populate matching pills).
- **Epic 3 — Stateless Optimization & History**: prompt optimization calls are
  resilient (Tenacity retries upstream, RFC-7807 502 on terminal failure), history
  logged on successful compile (`POST /api/v1/history`), Quick-History Drawer shows
  latest 20 (`GET /api/v1/history`, `(user_id, created_at DESC)` index), reload a
  history card back onto the canvas, delete a record
  (`DELETE /api/v1/history/{id}`).

## API & error conventions

- REST namespace: `/api/v1/...`.
- All error responses MUST be RFC-7807 problem+json:
  `{ type, title, status, detail, instance, error_code }` — see `agent/BA.md` §4.2 for
  the exact `UNAUTHORIZED_ACCESS` / `LLM_PROVIDER_ERROR` shapes to match against.
- Auth: JWT in `Authorization: Bearer <token>`, 7-day expiry, stored client-side in
  `localStorage`.

## Frontend stack & conventions

- **Stack**: React 19 + TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`),
  React Router 7, Vitest + Testing Library (jsdom environment).
- **Structure**: feature-first under `src/features/<feature>/pages` (see
  `src/features/home`); shared cross-feature code under `src/shared/{components,hooks,
  types,utils}`; app shell/routing under `src/app`.
- **Path alias**: `@` → `src/`.
- **Lint/format**: `oxlint` (rules in `.oxlintrc.json`: `react/rules-of-hooks` error,
  `react/only-export-components` warn) and `prettier` (`.prettierrc`: no semicolons,
  single quotes, printWidth 100). Run `npm run lint` / `npm run format` before
  reporting a change done.
- **Scripts**: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run test`
  (Vitest), `npm run lint`, `npm run format`, `npm run preview`.
- **Auto-resize inline inputs**: per `agent/BA.md` §4.3, measure width via an
  off-screen hidden `span` mirroring the typed text (same font family/weight/size),
  read its `clientWidth`, add a small padding buffer, apply to the input's `width`.
  This is the app's signature interaction — reuse this technique anywhere a
  fill-in-the-blank pill is rendered, don't invent a second method.

## Visual design direction

**`docs/design/how2prompt-workspace-mockup.html`** is the source of truth for this —
open it directly in a browser, no build step needed. Check it before building or
restyling any screen. It's an inline fill-in-the-blank design: cool paper neutrals
(`#F3F5F0` light / `#14171A` dark), indigo accent (`#3652E0` light / `#8493FF` dark),
system sans for body/headings, monospace reserved specifically for anything
placeholder/template-related (`{field}` labels, code/error badges, pills). Carry these
tokens forward instead of introducing a new palette per page.

The mockup's Login/Register screens match the real implementation in
`src/features/auth` closely. Its catalog/prompt-editor/history/custom-template screens
are **design-only previews of Epic 1/3** — nothing under `src/features` implements them
yet; when that work starts, use the mockup as the visual reference but still go
through `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` for the real feature
(per Constitution Principle II), don't build straight from the mockup's inline JS.
