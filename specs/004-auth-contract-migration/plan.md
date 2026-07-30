# Implementation Plan: Auth API Contract Migration (v1.1.0)

**Branch**: `004-auth-contract-migration` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-auth-contract-migration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

The backend redeployed `docs/api/openapi.yaml`/`API_CONTRACT.md` as v1.1.0: every JSON
field is now `camelCase`, non-`204` responses are documented as wrapped in
`ApiResponse<T> { data, meta }`, pagination moves to offset-based `page`/`size`, Google
sign-in collapses to a single `POST /auth/oauth/google { idToken }` call (dropping the
authorization-code redirect + callback), `verify-email` moves from a `GET ?token=`
request to `POST` with a `{ token }` body, `resend-verification` now answers `202`, and
both the reset-password and verify-email "link expired/used" cases are documented as a
single `410` condition (`TOKEN_CONSUMED` in `API_CONTRACT.md`'s error table) instead of
two. The approach is a mechanical, interface-preserving migration: `authClient.real.ts`
and `httpClient.ts` change their wire-level field names, response unwrapping, and the
Google flow's transport; the `AuthClient` interface, `authClient.mock.ts`, and every
consuming page/component (`LoginPage`, `RegisterPage`, `ForgotPasswordPage`,
`ResetPasswordPage`, `VerifyEmailPage`) stay untouched, with one exception:
`EmailVerificationBanner` needs a copy change so its resend-confirmation message no
longer implies immediate delivery (FR-005). The
one genuinely new piece of client-side work is that `AuthResponse` no longer embeds the
user profile, so every token-issuing call (`login`, `signInWithGoogle`, `restoreSession`)
must follow up with `GET /users/me` to assemble a `Session` — a pattern
`restoreSession()` already uses today.

## Technical Context

**Language/Version**: TypeScript 5 (React 19), no version change required by this
migration.

**Primary Dependencies**: React Router 7 (route removal/redirect for the dead Google
callback path), the existing `fetch`-based `httpClient.ts` wrapper (no HTTP library
swap), Google Identity Services script already loaded by `googleIdentity.ts`/the mock
client (reused, not newly introduced, for the real client's ID-token flow).

**Storage**: N/A — session lives in React state (`AuthProvider`) plus the backend's
httpOnly `refresh_token` cookie; no client-side persistence changes.

**Testing**: Vitest + Testing Library (existing suite: `AuthContext.test.tsx`,
`LoginPage.test.tsx`, `RegisterPage.test.tsx`, `ForgotPasswordPage.test.tsx`,
`ResetPasswordPage.test.tsx`, `VerifyEmailPage.test.tsx`, `EmailVerificationBanner.test.tsx`)
must keep passing unmodified in intent (mock-client-backed), per spec SC-002.

**Target Platform**: Web SPA (Vite build), unchanged.

**Project Type**: Web frontend, single project (`src/features/auth/**`), no new
project/package boundary introduced.

**Performance Goals**: N/A — no new performance target; existing auth flow latency
expectations are unaffected (one extra `GET /users/me` round trip after login/Google
sign-in is the only added network cost, matching what `restoreSession()` already pays
today).

**Constraints**: No user-visible wording/screen change beyond what spec FR-003
(Google flow loses its callback step, old callback path redirects to `/login`) and
FR-005 (resend wording no longer implies immediate delivery) explicitly require; the
existing automated test suite must pass at the same rate as before (SC-002).

**Scale/Scope**: Limited to Epic 1 Auth (`src/features/auth/api/{httpClient,authClient.real,authClient.mock,authClient.types,types}.ts`,
`src/features/auth/context/{AuthContext,AuthProvider}.ts(x)`,
`src/features/auth/components/EmailVerificationBanner.tsx` (copy-only, FR-005),
`src/features/auth/pages/GoogleCallbackPage.tsx` (removed),
`src/features/auth/api/googleIdentity.ts`, `src/app/App.tsx` routing) plus a PATCH-level
amendment to `.specify/memory/constitution.md` Principle III's stale `trace_id` example
and a documentation fix to `CLAUDE.md`'s Google OAuth flow description (now outdated by
research.md Decision 3). Other epics (templates/history/favorites/admin) are
unimplemented and out of scope, per spec Assumptions.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dynamic Form Rendering Integrity (NON-NEGOTIABLE)** — N/A. This migration
  touches no template-generation/dynamic-form screen; it is confined to
  `src/features/auth`. PASS.
- **II. Spec-Before-Code** — This work is going through the
  `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-implement` chain, per this feature's own artifacts. PASS.
- **III. Contract & Error Consistency** — This migration exists specifically to keep
  the frontend aligned with `docs/api/openapi.yaml` as the authoritative wire
  contract (naming, envelope, error shape, token lifecycle all stay conceptually the
  same — only field spelling and a couple of endpoint shapes change). One finding:
  the constitution's own Principle III literally quotes the error envelope with
  `trace_id` (snake_case), which the v1.1.0 contract renamed to `traceId` — this is
  addressed as an explicit PATCH-level constitution amendment in this same change
  (see Clarifications Q2 in spec.md and research.md Decision 7), not left to drift.
  PASS, with that amendment tracked as a plan task.
- **IV. Security Non-Negotiables** — No change to password hashing, HTTPS, or secret
  handling; the Google ID-token flow still lets the backend verify the token
  server-side rather than trusting client-decoded claims (`authClient.real.ts` sends
  the raw `idToken`, never the decoded payload, to `POST /auth/oauth/google`). PASS.
- **V. Verified Before Done** — `oxlint`, `tsc -b && vite build`, and `vitest` must
  all pass, and the Google sign-in + verify-email + reset-password flows must be
  exercised in a running browser (against the mock client, since no live v1.1.0
  backend is available in this environment) before this feature is reported done.
  PASS (gate to satisfy during implementation, not a design violation).

No violations requiring justification — Complexity Tracking is left empty.

**Post-Phase 1 re-check**: research.md and data-model.md/contracts/quickstart.md were
produced without surfacing any new principle conflict. The `AuthClient` interface
staying stable (contracts/auth-client.md) reinforces Principle III's intent (one
integration point, one predictable contract) rather than straining it. The Google
ID-token flow keeps verification server-side, matching Principle IV. Re-check: PASS,
unchanged from the pre-Phase-0 evaluation above.

## Project Structure

### Documentation (this feature)

```text
specs/004-auth-contract-migration/
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
│   └── App.tsx                              # remove GoogleCallbackPage route, add /auth/google/callback → redirect to /login
└── features/auth/
    ├── api/
    │   ├── httpClient.ts                    # ApiErrorBody.trace_id → traceId; response unwrapping for ApiResponse<T>
    │   ├── authClient.real.ts               # field renames, /users/me follow-up call, Google idToken flow, verify-email POST body
    │   ├── authClient.mock.ts               # kept behaviorally aligned with the AuthClient interface (no field renames needed)
    │   ├── authClient.types.ts              # unchanged (AuthClient interface is stable across this migration)
    │   ├── types.ts                         # unchanged (Session/*Outcome shapes are stable across this migration)
    │   └── googleIdentity.ts                # extended to also expose the raw ID token string, not just decoded claims
    ├── context/
    │   ├── AuthContext.ts                   # unchanged
    │   └── AuthProvider.tsx                 # unchanged (already re-uses restoreSession() for refresh/verify)
    ├── components/
    │   └── EmailVerificationBanner.tsx      # copy-only change: resend confirmation wording (FR-005)
    └── pages/
        └── GoogleCallbackPage.tsx           # removed

.specify/memory/constitution.md              # PATCH: Principle III's trace_id example → traceId

tests/ (co-located *.test.tsx per existing convention, not a separate tests/ tree)
```

**Structure Decision**: Existing feature-first layout (`src/features/<feature>/{api,context,pages,components}`)
is reused as-is — this migration edits wire-level internals of already-existing files
under `src/features/auth/api` and removes one now-dead page/route; it introduces no new
directories, no new feature module, and no `tests/` tree separate from the project's
existing co-located `*.test.tsx` convention.

## Complexity Tracking

_No Constitution Check violations — this section intentionally left empty._
