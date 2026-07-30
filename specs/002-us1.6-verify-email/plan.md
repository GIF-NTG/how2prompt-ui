# Implementation Plan: Verify Email (+ Resend)

**Branch**: `002-us1.6-verify-email` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-us1.6-verify-email/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add the missing email-verification flow: a new `VerifyEmailPage` (reads `?token=`
from the URL, works with or without an active session), a persistent
`EmailVerificationBanner` shown on authenticated pages while `session.emailVerified`
is `false` (with a resend action and a 5-minute client-side countdown), two new
`AuthClient` methods (`verifyEmail`, `resendVerificationEmail`), and two new
`AuthContext` actions that wrap them — wired against `docs/api/openapi.yaml`'s
`/auth/verify-email` and `/auth/resend-verification`. `Session` gains an
`emailVerified` field, sourced from data the backend already returns on every
session-issuing response (no new profile fetch needed).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19

**Primary Dependencies**: React Router 7 (routing, `useSearchParams` — same pattern as
`ResetPasswordPage`), Tailwind CSS v4 (existing tokens), the project's own
`httpClient.ts` (`fetch` wrapper) — no new dependency.

**Storage**: N/A — the verification token lives only in the URL query string for the
lifetime of the verify page; the 5-minute resend countdown lives in component state
(research.md Decision 5), not persisted.

**Testing**: Vitest + Testing Library (jsdom), following the existing
`ForgotPasswordPage.test.tsx` / `ResetPasswordPage.test.tsx` pattern (render → interact
→ assert on `AuthClient`/`AuthContext` outcome), plus a new test for
`EmailVerificationBanner`'s countdown behavior.

**Target Platform**: Web browser (SPA), same as the rest of the app.

**Project Type**: Web frontend — single project (`how2prompt-ui`), no backend work
(backend endpoints already deployed per spec Assumptions).

**Performance Goals**: No new goals beyond the project-wide SPA defaults.

**Constraints**: MUST go through `AuthClient`/`AuthContext` (no component may call
`fetch`/`apiFetch` directly); error envelope MUST match
`docs/api/openapi.yaml`/Constitution Principle III; the banner MUST NOT introduce a
new visual pattern beyond the existing auth-screen tokens (CLAUDE.md "Visual design
direction").

**Scale/Scope**: 1 new page + route (`verify-email`), 1 new shared component
(`EmailVerificationBanner`, rendered from `RootLayout`), 2 new `AuthClient` methods (+
mock/real implementations), 2 new `AuthContext` actions, 1 new field on `Session`
(`emailVerified`), 2 new outcome types.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Applicability                                                                                                                                                                                                                                                                                                                                                                                                | Status                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| I. Dynamic Form Rendering Integrity | N/A — not Epic 3; no `template_variables`-driven form involved. The banner and verify page are plain auth-surface UI, not a new pill/form pattern for template generation.                                                                                                                                                                                                                                   | PASS                                 |
| II. Spec-Before-Code                | This plan follows an approved, clarified spec (`spec.md`, clarified via `/speckit-clarify`).                                                                                                                                                                                                                                                                                                                 | PASS                                 |
| III. Contract & Error Consistency   | New calls target `/auth/verify-email` and `/auth/resend-verification` from `docs/api/openapi.yaml`; error envelope parsed via the existing `httpClient.ts`/`ApiError` (status-based branching reused from `001`'s Decision 1, no changes needed); `resendVerificationEmail` correctly carries `Authorization: Bearer` per the endpoint's inherited global `bearerAuth` requirement (research.md Decision 2). | PASS                                 |
| IV. Security Non-Negotiables        | No password hashing, HTTPS enforcement, or secret storage happens client-side; only calls already-deployed backend endpoints. No secrets introduced.                                                                                                                                                                                                                                                         | PASS                                 |
| V. Verified Before Done             | `oxlint`, `tsc -b && vite build`, and `vitest` must pass; the verify page and banner (incl. resend + countdown) must be exercised in a running browser before this feature is reported done.                                                                                                                                                                                                                 | PASS (gate noted for implementation) |

No violations — Complexity Tracking section is empty and omitted.

**Post-Phase 1 re-check**: Design artifacts (`research.md`, `data-model.md`,
`contracts/auth-client.md`) introduce one additive `Session` field
(`emailVerified`), two new `AuthClient` methods, and two new `AuthContext` actions —
all follow the existing single-integration-point contract (Principle III) and touch
no template-rendering or catalog surface (Principle I stays N/A). No new violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-us1.6-verify-email/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── auth-client.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/features/auth/
├── api/
│   ├── authClient.ts            # unchanged — mock/real switch, no edits needed
│   ├── authClient.types.ts      # + verifyEmail, resendVerificationEmail to AuthClient
│   ├── authClient.mock.ts       # + mock implementations; MockAccountRecord + emailVerified
│   ├── authClient.real.ts       # + real implementations; BackendUser + email_verified
│   ├── httpClient.ts            # unchanged — ApiError.status already exists (001)
│   └── types.ts                 # + Session.emailVerified, VerifyEmailOutcome, ResendVerificationOutcome
├── context/
│   ├── AuthContext.tsx          # + resendVerificationEmail, verifyEmail to context value type
│   └── AuthProvider.tsx         # + implementations of both new actions
├── components/
│   ├── AuthLayout.tsx            # reused as-is (VerifyEmailPage)
│   ├── InlineBlankForm.tsx       # reused as-is (VerifyEmailPage has no form, but layout tokens apply)
│   └── EmailVerificationBanner.tsx  # NEW
│   └── EmailVerificationBanner.test.tsx  # NEW
├── pages/
│   ├── VerifyEmailPage.tsx       # NEW
│   └── VerifyEmailPage.test.tsx  # NEW

src/app/
├── App.tsx                       # + route: verify-email
└── layout/
    └── RootLayout.tsx            # + renders EmailVerificationBanner when session && !emailVerified
```

**Structure Decision**: Single-project frontend, feature-first layout already
established by `src/features/auth` — no new top-level directories. `RootLayout`
(outside the `auth` feature slice, in `src/app/layout`) is touched because it's the
one place authenticated pages already share cross-cutting UI (the sign-out bar), the
same reason it already reads `useAuth()`.

## Complexity Tracking

_No Constitution Check violations — this section intentionally left empty._
