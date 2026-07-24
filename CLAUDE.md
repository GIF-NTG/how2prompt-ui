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
  full name + password, BCrypt hash), short-lived `access_token` (15 min) +
  httpOnly-cookie `refresh_token` — see API & error conventions below for the
  corrected session model (supersedes the submodule docs' original "JWT 7-day,
  localStorage-only" assumption). Implemented in `src/features/auth/api/
  authClient.real.ts` (plain `fetch` via `httpClient.ts`, not Axios): attaches
  `Authorization: Bearer <access_token>`, and `AuthProvider` refreshes silently
  ~60s before expiry via a scheduled `restoreSession()` call rather than an
  interceptor reacting to a live `401`. Team Lead–only shared team variables
  (`PUT /api/v1/users/me/variables`, JSONB, pre-populate matching pills) —
  not present in `docs/api/openapi.yaml`'s Phase 1 scope, revisit when Team Lead work
  starts.
- **Epic 3 — Stateless Optimization & History**: prompt optimization calls are
  resilient (Tenacity retries upstream, `502` with `error.code` on terminal failure —
  not RFC-7807, see below), history logged on successful compile
  (`POST /api/v1/history` in the submodule docs; the real contract's equivalent is
  `POST /templates/{id}/generate`, which both compiles and logs history server-side),
  Quick-History Drawer shows latest 20, reload a history card back onto the canvas,
  delete a record. Reconcile exact endpoint names against `docs/api/openapi.yaml`
  when this epic's implementation starts — it doesn't match the submodule docs 1:1.

## API & error conventions

**`docs/api/openapi.yaml`** (this repo, provided by Backend 2026-07-24) is the
authoritative wire contract — check it before wiring any real endpoint. It supersedes
`agent/BA.md`'s RFC-7807 assumption, which the real API does not follow.

- REST namespace: `/api/v1/...`.
- All error responses are `{ error: { code, message, details?, trace_id? } }` — NOT
  RFC-7807. Branch UI logic on `error.code` (e.g. `INVALID_CREDENTIALS`,
  `EMAIL_ALREADY_EXISTS`, `TOKEN_EXPIRED`, `VALIDATION_ERROR`, `GUEST_QUOTA_EXCEEDED`).
- Auth: `Authorization: Bearer <access_token>`. `access_token` expires in **15
  minutes** — on `401 TOKEN_EXPIRED`, call `POST /auth/refresh` to rotate it.
  `refresh_token` lives only in an httpOnly cookie the frontend never reads directly.
- Google sign-in is the standard **authorization-code + redirect** flow:
  `GET /auth/oauth/google` → `{ authorization_url, state }` → full-page redirect to
  Google → Google redirects back to `GoogleCallbackPage` (`/auth/google/callback`)
  with `code`+`state` → `POST /auth/oauth/google/callback`. Implemented in
  `authClient.real.ts` + `completeGoogleOAuth`. This is a **different** flow from
  the client-side Google Identity Services "One Tap" approach in
  `src/features/auth/api/googleIdentity.ts`, which is now mock-only — set
  `VITE_API_BASE_URL` to switch to the real redirect flow; nothing else changes
  (`authClient.ts` picks the implementation automatically).
- Guest access: some endpoints (templates, taxonomy, `ai-models`) work without a
  token; `POST /templates/{id}/generate` allows Guests but requires an
  `X-Guest-Fingerprint` header and is capped at 3/day/IP server-side.

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
