# CLAUDE.md — how2prompt-ui

Frontend SPA for **How2Prompt**, a platform that helps users write better prompts for
popular AI models (ChatGPT, Claude, Gemini, Midjourney, ...) via a curated template
library: pick a template, fill in a dynamic form generated from its declared
variables, get a rendered prompt back to copy.

Full specs live in the `how2prompt-agentic` submodule (SRS v2.0) — treat these as
source of truth, not this file:

- `how2prompt-agentic/docs/SRS.md` — software requirements spec (epics, roadmap
  phases, non-functional requirements).
- `how2prompt-agentic/docs/use-cases.md` — detailed use cases per epic.
- `how2prompt-agentic/agent/BA.md` — BA spec: persona/access matrix, BDD acceptance
  criteria per user story, DB JSONB schemas (`template_variables`,
  `generated_prompts.input_values`), error catalog.
- `how2prompt-agentic/docs/user-stories/*.md` — one file per story, most detailed
  level, named `us-<epic>.<n>-<slug>.md`.

Note: `epics.md` (the old epic/story breakdown) was removed from the submodule and
replaced by `SRS.md` §3 + `use-cases.md` + `BA.md` §2 — the epic numbering below
reflects that restructure and does **not** match epic numbers from before this update.

## Product shape

- **Personas** (`agent/BA.md` §1.2): Guest (unauthenticated — browse/search/view
  templates only), User (registered — generate/copy prompts, history, favorites),
  Admin (manages AI models, taxonomy, official templates, analytics). Team
  Workspace personas (Owner/Admin/Editor/Viewer) are Phase 4 (`SRS.md` Epic 9) — not
  in scope yet.
- **Epic 1 — User Identity & Access Management** (Phase 1): register (email + full
  name + password, BCrypt hash) with email verification, login (email/password),
  Google OAuth, logout, forgot/reset password, manage profile. Session model:
  short-lived `access_token` (15 min) + httpOnly-cookie `refresh_token`, rotated on
  each refresh — see API & error conventions below. Implemented in
  `src/features/auth/api/authClient.real.ts` (plain `fetch` via `httpClient.ts`, not
  Axios): attaches `Authorization: Bearer <access_token>`, and `AuthProvider`
  refreshes silently ~60s before expiry via a scheduled `restoreSession()` call
  rather than an interceptor reacting to a live `401`.
- **Epic 2 — Template Discovery & Browsing** (Phase 1): browse the template library,
  filter by category/tag/AI model (deep-linkable via URL query string), full-text
  search (debounced 300ms), template detail page, featured/trending sections on the
  homepage. All of this is Guest-accessible per the persona matrix — no auth
  required.
- **Epic 3 — Prompt Generation Engine** (Phase 1, core MVP): select the target AI
  model (loads a `template_variants` override if one exists for that model),
  render a **dynamic form** from the template's `template_variables` JSONB (field
  types: text, textarea, select, multiselect, number, boolean, slider — client-side
  validation per each variable's `validation` config: min/max/regex/required),
  live client-side preview (replace `{{var_key}}` placeholders as the user types —
  UX-only, not authoritative), optional free-form "additional instructions" field,
  Generate & Copy calls `POST /templates/{id}/generate` — the **backend re-renders
  the final prompt server-side** (source of truth for consistency/audit) and logs
  it to history in the same call. Guest-accessible but capped at 3/day/IP via
  `X-Guest-Fingerprint` (see API conventions below); registered Users get
  unlimited generation logged to their own history.
- **Epic 4 — Prompt History & Favorites** (Phase 1): history auto-saved on every
  successful generate (no separate log call — same `/generate` request persists it),
  `/history` page filterable by template/model/date, reload a history item back
  onto the generate form (pre-fills `input_values`, creates a new record on
  re-generate rather than overwriting), favorite/unfavorite templates, soft-delete
  history records.
- **Epic 5 — Admin & Content Management** (Phase 1): admin CRUD for AI models,
  categories/tags (nested taxonomy), create & publish official templates
  (`is_official=true`), analytics dashboard. Not yet started on the frontend.
- **Later phases** (not in scope yet, see `SRS.md` §6 roadmap): Epic 6 AI
  Enhancement — refine/score/playground (Phase 2); Epic 7 Template Customization &
  Versioning — fork/edit/version (Phase 2); Epic 8 Community & Social — votes,
  comments, follow (Phase 3); Epic 9 Team Workspace & Billing — team roles, shared
  templates, Stripe subscriptions (Phase 4, includes a "Team Lead"-style role for
  shared team variables — no such endpoint exists in `docs/api/openapi.yaml` yet;
  design it when Phase 4 work starts instead of assuming a shape now).

## API & error conventions

**`docs/api/openapi.yaml`** (this repo, provided by Backend 2026-07-24) is the
authoritative wire contract — check it before wiring any real endpoint. Its error
envelope matches `agent/BA.md` §4.3.

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
- **Dynamic form rendering**: per `agent/BA.md` §2 (US-3.2), read a template's
  `template_variables` JSONB array and render one form control per `input_type`
  (text, textarea, select, multiselect, number, boolean, slider), label/placeholder
  text pulled from that variable's i18n JSONB (`{"en": ..., "vi": ...}`), and apply
  client-side validation from its `validation` config (min/max/regex/required) —
  disable Generate until required fields are filled. This replaces the earlier
  inline fill-in-the-blank pill/canvas approach; don't reintroduce it.

## Visual design direction

**`docs/design/how2prompt-workspace-mockup.html`** has been regenerated against the
SRS v2.0 restructure (2026-07-27) — it now shows the catalog/template-detail/history
screens as a **dynamic form** (Epic 3), not the old pill/canvas UX. Color tokens:
cool paper neutrals (`#F3F5F0` light / `#14171A` dark), indigo accent (`#3652E0`
light / `#8493FF` dark), system sans for body/headings, monospace reserved for
placeholder/template-related content (`{field}` labels, code/error badges). See
`docs/design/README.md` for the full status. The auth screens (Login/Register/
Forgot/Reset) still use the inline fill-in-the-blank pill pattern (per Constitution
Principle I, that pattern is confined to auth and MUST NOT extend to
template-generation screens); the catalog/detail/history screens use standard boxed
form controls instead. Login/Register match the real implementation in
`src/features/auth`; Forgot/Reset match `001-us1.5-forgot-reset-password`. The
catalog/detail/history screens remain **design-only** — nothing under `src/features`
implements Epic 2/3/4 yet. Still go through `/speckit-specify` → `/speckit-plan` →
`/speckit-tasks` for any new feature (per Constitution Principle II) — use the
mockup as the visual reference, not a reason to build straight from its inline JS.
