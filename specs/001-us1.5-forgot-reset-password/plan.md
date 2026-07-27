# Implementation Plan: Forgot & Reset Password

**Branch**: `001-us1.5-forgot-reset-password` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-us1.5-forgot-reset-password/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add the two missing screens (`ForgotPasswordPage`, `ResetPasswordPage`) and two new
`AuthClient` methods (`requestPasswordReset`, `resetPassword`) so a user who forgets
their password can recover their account end-to-end, without revealing whether an
email exists and without inventing a new UI pattern — this reuses the existing
`AuthLayout`/`InlineBlank` auth-screen components and the existing mock/real
`AuthClient` split (`authClient.mock.ts` / `authClient.real.ts`), wired against
`docs/api/openapi.yaml`'s `/auth/forgot-password` and `/auth/reset-password`.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19

**Primary Dependencies**: React Router 7 (routing), Tailwind CSS v4 (existing auth
screen tokens), the project's own `httpClient.ts` (`fetch` wrapper, not Axios) — no
new dependency is introduced.

**Storage**: N/A — no client-side persistence beyond the existing `AuthClient`
session store; the reset/verification token lives only in the URL query string for
the lifetime of the page.

**Testing**: Vitest + Testing Library (jsdom), following the existing
`LoginPage.test.tsx` / `RegisterPage.test.tsx` pattern (render → interact → assert on
`AuthClient` outcome).

**Target Platform**: Web browser (SPA), same as the rest of the app.

**Project Type**: Web frontend — single project (`how2prompt-ui`), no backend work
(backend endpoints already deployed per spec Assumptions).

**Performance Goals**: No new goals beyond the project-wide defaults already in
`how2prompt-agentic/docs/SRS.md` §5.1 (standard SPA responsiveness) — this feature
adds two lightweight forms, no data-heavy views.

**Constraints**: MUST go through the single `AuthClient` integration point (no
component may call `fetch`/`apiFetch` directly, mirroring the existing contract's
"What callers MUST NOT do" rule); error envelope MUST match
`docs/api/openapi.yaml`/Constitution Principle III.

**Scale/Scope**: 2 new pages, 2 new routes, 2 new `AuthClient` methods (+ mock/real
implementations), 1 new field appended to `ApiError` (HTTP status — see
`research.md`), 1 new "Forgot password?" link added to `LoginPage`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicability | Status |
|---|---|---|
| I. Dynamic Form Rendering Integrity | N/A — this feature is not Epic 3 (Prompt Generation Engine); no `template_variables`-driven form is involved. The existing `InlineBlank` pill component is reused, which the principle explicitly permits for auth screens ("confined to the auth screens that already use it") — this remains an auth screen. | PASS |
| II. Spec-Before-Code | This plan follows an approved spec (`spec.md`, clarified via `/speckit-clarify`). | PASS |
| III. Contract & Error Consistency | New calls target `/auth/forgot-password` and `/auth/reset-password` from `docs/api/openapi.yaml`; error envelope parsed via the existing `httpClient.ts`/`ApiError`, extended (not replaced) to carry HTTP status — see `research.md` Decision 1. | PASS |
| IV. Security Non-Negotiables | No password hashing, HTTPS enforcement, or secret storage happens client-side; this feature only calls already-deployed backend endpoints. No secrets introduced. | PASS |
| V. Verified Before Done | `oxlint`, `tsc -b && vite build`, and `vitest` must pass; both new pages must be exercised in a running browser before this feature is reported done (implementation-phase gate, not a plan-time violation). | PASS (gate noted for implementation) |

No violations — Complexity Tracking section is empty and omitted.

**Post-Phase 1 re-check**: Design artifacts (`research.md`, `data-model.md`,
`contracts/auth-client.md`) introduce one additive change to shared code
(`ApiError.status`, Decision 1) and two new `AuthClient` methods — both follow the
existing single-integration-point contract exactly (Principle III) and touch no
template-rendering or catalog surface (Principle I stays N/A). No new violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-us1.5-forgot-reset-password/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── auth-client.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/features/auth/
├── api/
│   ├── authClient.ts            # unchanged — mock/real switch, no edits needed
│   ├── authClient.types.ts      # + requestPasswordReset, resetPassword to AuthClient
│   ├── authClient.mock.ts       # + mock implementations of both new methods
│   ├── authClient.real.ts       # + real implementations against openapi.yaml
│   ├── httpClient.ts            # + expose HTTP status on ApiError (research.md Decision 1)
│   └── types.ts                 # + PasswordResetRequestOutcome, PasswordResetOutcome
├── pages/
│   ├── LoginPage.tsx             # + "Forgot password?" link
│   ├── ForgotPasswordPage.tsx    # NEW
│   ├── ForgotPasswordPage.test.tsx  # NEW
│   ├── ResetPasswordPage.tsx     # NEW
│   └── ResetPasswordPage.test.tsx   # NEW
└── components/
    ├── AuthLayout.tsx            # reused as-is
    └── InlineBlankForm.tsx       # reused as-is

src/app/
└── App.tsx                       # + routes: forgot-password, reset-password
```

**Structure Decision**: Single-project frontend, feature-first layout already
established by `src/features/auth` — no new top-level directories. This feature adds
files inside the existing `auth` feature slice rather than creating a new feature
folder, since forgot/reset password is part of the same Epic 1 identity/access
surface as login/register/logout, not a separate product area.

## Complexity Tracking

*No Constitution Check violations — this section intentionally left empty.*
