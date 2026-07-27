# Implementation Plan: Manage Personal Profile (US-1.7)

**Branch**: `003-us1.7-manage-profile` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-us1.7-manage-profile/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A logged-in user views and edits their profile (full name, username, bio, locale)
from a new settings page, backed by `GET /users/me` (prefill) and
`PATCH /users/me` (save), both already defined in `docs/api/openapi.yaml`. On
success, the name shown in the top-bar "account menu" (`RootLayout.tsx`) updates
immediately without a page reload. A duplicate-username save (`409`) shows an
inline error without discarding the rest of the form. This follows the same
`AuthClient`-mediated, mock-first pattern as every other Epic 1 story
(`authClient.mock.ts` / `authClient.real.ts` behind one interface) — no new
architectural pattern is introduced.

**Known live-backend caveat**: manual verification against the real backend is
currently blocked by an already-reported backend gap — `GET /users/me` returns
`404 NOT_FOUND` on the live v1.1.0 deployment even though it's documented in the
contract (see the `EMAIL_NOT_VERIFIED`/`/users/me` bug report from
`specs/004-auth-contract-migration`). This feature's frontend work is not blocked
(it's built and tested against `authClient.mock.ts` like every other story), but
its own real-backend validation depends on the same fix.

## Technical Context

**Language/Version**: TypeScript 5 (React 19), no version change.

**Primary Dependencies**: Existing `AuthClient`/`httpClient.ts`/`AuthContext`
stack (no new library) — `GET /users/me` and `PATCH /users/me` already unwrap
through the `ApiResponse<T>` envelope handling added in
`specs/004-auth-contract-migration`.

**Storage**: N/A — profile data is fetched on demand from the backend; only
`Session.displayName` is mirrored into client-side `AuthContext` state (so the
top-bar name updates immediately per FR-004), not the full profile.

**Testing**: Vitest + Testing Library (existing convention: co-located
`*.test.tsx`), run against `authClient.mock.ts`.

**Target Platform**: Web SPA (Vite build), unchanged.

**Project Type**: Web frontend, single project — this story adds one new page
under the existing `src/features/auth` module (Epic 1 already groups every
Identity & Access Management story there — register/login/forgot-reset/verify —
so profile management joins them rather than starting a new `src/features/profile`
module).

**Performance Goals**: N/A — no explicit target beyond spec SC-001 (update
reflected in the UI in under 10 seconds, which a single `PATCH` round trip
trivially meets).

**Constraints**: Client-side validation must mirror the backend's declared
limits (`UpdateProfileRequest.fullName` maxLength 150, `.username` maxLength 50)
— `bio`/`locale` have no declared length/format constraint beyond `locale`'s
`en`/`vi` enum, so no invented client-side cap is added for `bio`. A duplicate
username (`409`) must not discard the user's other unsaved field values.

**Scale/Scope**: One new page (`ProfileSettingsPage`), one new route (`/profile`),
small additions to `AuthClient`/`authClient.mock.ts`/`authClient.real.ts`/`types.ts`,
and a small link from `RootLayout.tsx`'s existing top bar to reach the page. Avatar
upload (`POST /users/me/avatar`) is explicitly out of scope per spec Assumptions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Dynamic Form Rendering Integrity (NON-NEGOTIABLE)** — N/A. This is a
  fixed, hand-built settings form (full name/username/bio/locale), not a
  template-generation screen driven by `template_variables` JSONB — Principle I
  only governs Epic 3 screens. PASS.
- **II. Spec-Before-Code** — Following the same spec → plan → tasks → implement
  chain as every other story in this repo. PASS.
- **III. Contract & Error Consistency** — Uses `GET`/`PATCH /users/me` exactly as
  documented in `docs/api/openapi.yaml`, through the existing `apiFetch`
  envelope-unwrapping and `ApiError` handling (no new error-shape assumptions).
  The `409` duplicate-username case has no documented body `error.code` (same
  situation as `RESET_TOKEN_EXPIRED`/`VERIFY_TOKEN_EXPIRED` before it) — handled
  by deriving a client-side `USERNAME_TAKEN` code from `ApiError.status === 409`,
  consistent with that established convention. PASS.
- **IV. Security Non-Negotiables** — No password/credential handling in this
  feature at all (email/password remain non-editable here per spec Key
  Entities). PASS.
- **V. Verified Before Done** — `oxlint`/`tsc -b && vite build`/`vitest` must
  pass, and the settings page must be exercised in a running browser (against
  the mock client, since the real `/users/me` endpoint is currently 404 on the
  live backend — see Summary). PASS (gate to satisfy during implementation).

No violations requiring justification — Complexity Tracking is left empty.

**Post-Phase 1 re-check**: research.md/data-model.md/contracts/quickstart.md
introduce no new principle conflict — the profile update flow reuses the exact
error-derivation and `AuthClient`-mediation patterns already established by prior
Epic 1 stories. Re-check: PASS, unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/003-us1.7-manage-profile/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── App.tsx                              # add route: path="profile" → ProfileSettingsPage
└── features/auth/
    ├── api/
    │   ├── types.ts                         # add UserProfile, UpdateProfileInput, ProfileOutcome
    │   ├── authClient.types.ts              # add getProfile(accessToken), updateProfile(accessToken, input)
    │   ├── authClient.mock.ts               # implement both against MockAccountRecord
    │   └── authClient.real.ts               # implement both against GET/PATCH /users/me
    ├── context/
    │   ├── AuthContext.ts                   # add getProfile(), updateProfile(input) (session-token-mediated)
    │   └── AuthProvider.tsx                 # implement both; updateProfile success also updates session.displayName
    └── pages/
        ├── ProfileSettingsPage.tsx          # NEW — the settings form itself
        └── ProfileSettingsPage.test.tsx     # NEW

src/app/layout/RootLayout.tsx                # add a "Hồ sơ" link next to the existing name/logout controls
```

**Structure Decision**: Reuses the existing `src/features/auth` module rather
than introducing a new `src/features/profile` module — this repo already groups
every Epic 1 (Identity & Access Management) story under `src/features/auth`
(register, login, forgot/reset password, verify email), and profile management
is the same epic's remaining story. No new top-level directory or architectural
pattern; only one new page + small, additive changes to the existing
`AuthClient`/`AuthContext` files already touched by every prior Epic 1 story.

## Complexity Tracking

*No Constitution Check violations — this section intentionally left empty.*
