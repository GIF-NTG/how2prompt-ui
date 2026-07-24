# Implementation Plan: Login & Register UI (API-ready)

**Branch**: `feature/login-ui` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/20260724-013957-login-register-ui/spec.md`

## Summary

Build the Login and Register screens as real, navigable React routes using the
project's already-approved inline fill-in-the-blank interaction (email/password/
display-name rendered as auto-resizing blanks inside a sentence, not boxed inputs),
plus a "Đăng nhập bằng Google" alternative. No authentication backend exists yet, so
all outcomes (success, invalid credentials, duplicate email, Google sign-in) are
produced by one swappable in-app mock client behind a single `AuthClient` interface.
Wiring a real backend later means implementing that one interface against a real
endpoint — no change to any component, hook, or screen.

## Technical Context

**Language/Version**: TypeScript (React 19), per existing `tsconfig.app.json`.

**Primary Dependencies**: React Router 7 (view navigation), Tailwind CSS v4 (styling
tokens from the approved design direction), no new npm runtime dependency for the mock
auth client (plain `Promise`-based module). Google sign-in uses the real Google
Identity Services script (loaded dynamically at runtime, not an npm package) via a
public `VITE_GOOGLE_CLIENT_ID` env var — amended 2026-07-24 once a real Client ID was
supplied; see `research.md`'s amendment note. The credential is still only decoded
client-side, not verified, since no backend exists yet.

**Storage**: Browser `localStorage` only (mocked session record); no backend/database
in this feature.

**Testing**: Vitest + Testing Library (`@testing-library/react`, `jsdom`), already
configured in `vite.config.ts` / `src/test/setup.ts`.

**Target Platform**: Same as the rest of the SPA — evergreen desktop and mobile
browsers (Chrome, Safari, Edge, Firefox), per the project's NFR-2.

**Project Type**: Web application, frontend-only for this feature (`how2prompt-ui`).
No backend counterpart is touched or required to complete this feature.

**Performance Goals**: Inline blank typing must feel instant (<50ms perceived
input lag), consistent with the project's existing NFR-1 for the same interaction
pattern used elsewhere in the app.

**Constraints**: Must not introduce a second way of measuring/resizing inline inputs
(Constitution Principle I) or a second, ad hoc shape for auth outcomes — everything
funnels through one `AuthClient` interface (spec FR-009).

**Scale/Scope**: Two routed views (`/login`, `/register`) plus the shared inline-blank
and auth-state primitives they depend on. No multi-tenant, no concurrency concerns
(mock, single browser tab is the unit of context, consistent with existing
`localStorage`-based state in the app).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Fill-the-Blank Interaction Integrity | **PASS** | Auto-resize MUST reuse the single hidden-span technique — implemented once as a shared hook (`src/shared/hooks`), not duplicated inside the auth feature. Tab/Shift+Tab order and empty-required-field block+highlight+autofocus are carried over from the existing pattern (spec FR-004, FR-006). |
| II. Spec-Before-Code | **PASS** | This plan follows the approved `spec.md` (clarified 2026-07-24); no implementation starts before `/speckit-tasks` breaks it into tasks. |
| III. Contract & Error Consistency | **PASS (forward-compatible)** | No real `/api/v1/...` endpoint or RFC-7807 payload exists yet. The mocked `AuthOutcome` failure shape uses this feature's own `error_code` vocabulary (`INVALID_CREDENTIALS`, `EMAIL_ALREADY_REGISTERED`), styled after — but not identical to — `agent/BA.md` §4.2's `UNAUTHORIZED_ACCESS` example, so a real RFC-7807 response can be mapped onto it later without changing how screens read it. |
| IV. Security Non-Negotiables | **PASS (scoped)** | BCrypt/HTTPS apply once a real backend exists; until then, the equivalent obligation is: the mock `AuthClient` MUST NOT persist or log a raw password anywhere (not to `localStorage`, not to console) — only the resulting mocked session token is stored. |
| V. Verified Before Done | **PASS (enforced at implement time)** | `oxlint`, `tsc -b && vite build`, and `vitest` must pass, and both screens must be exercised in a running browser (light + dark), before any task is marked done. |

No violations — Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: `data-model.md`, `contracts/auth-client.md`, and
`quickstart.md` (Phase 1 outputs) introduce nothing that changes the table above —
the `AuthClient` contract *is* the single integration point Principle III/FR-009
require, the shared `useAutoResizeBlank` hook placement satisfies Principle I, and no
new dependency or persistence mechanism beyond one `localStorage` key was introduced.
Gate remains **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/20260724-013957-login-register-ui/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── auth-client.md
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── App.tsx                          # add /login, /register routes
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LoginPage.test.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── RegisterPage.test.tsx
│   │   ├── components/
│   │   │   ├── AuthLayout.tsx           # shared shell: top bar, 2-col panel, tabs (mockup parity)
│   │   │   ├── BraceField.tsx           # decorative background glyphs (mockup parity)
│   │   │   ├── InlineBlankForm.tsx      # sentence-with-blanks layout shell
│   │   │   ├── GuestContinueLink.tsx    # FR-015, rendered in AuthLayout's top bar
│   │   │   └── GoogleSignInButton.tsx
│   │   ├── api/
│   │   │   ├── authClient.ts            # the ONE swappable integration point (FR-009)
│   │   │   ├── authClient.types.ts      # the AuthClient interface (kept neutral)
│   │   │   ├── authClient.mock.ts       # current mocked implementation
│   │   │   ├── googleIdentity.ts        # real Google Identity Services (One Tap) loader
│   │   │   └── types.ts                 # AuthOutcome, Session, Account shapes
│   │   └── context/
│   │       ├── AuthContext.ts           # context object + value type
│   │       ├── AuthProvider.tsx         # provider component
│   │       └── useAuth.ts               # consumer hook (signed-in state + localStorage session)
│   └── home/                            # existing, unchanged
└── shared/
    └── hooks/
        └── useAutoResizeBlank.ts         # single hidden-span measuring technique,
                                          # reused by auth AND any future template UI
```

**Structure Decision**: Frontend-only, feature-first, matching the existing repo
convention (`src/features/<feature>/pages`, shared cross-feature code in
`src/shared/*`, path alias `@` → `src/`). No backend/`Option 2` split applies —
`how2prompt-ui` is the frontend repo only; the eventual real API lives in a sibling
service repo per the constitution's Technology & Architecture Constraints section.
The auto-resize measuring hook is promoted to `src/shared/hooks` (not kept inside
`features/auth`) specifically because Constitution Principle I requires exactly one
implementation of that technique across the whole app, not one per feature.

Repo root also gained: `src/vite-env.d.ts` (types `VITE_GOOGLE_CLIENT_ID`),
`.env.example` (committed placeholder), and `.env.local` (real Client ID, already
covered by the existing `*.local` `.gitignore` pattern — never committed).

## Complexity Tracking

*No constitution violations — not applicable.*
