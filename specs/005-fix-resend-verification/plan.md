# Implementation Plan: Fix Resend-Verification Contract & Add Login-Screen Resend Action

**Branch**: `005-fix-resend-verification` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-fix-resend-verification/spec.md`

## Summary

`docs/api/openapi.yaml` documents `POST /auth/resend-verification` as requiring
`Authorization: Bearer` with no body, but live testing against the real backend shows
it is actually public (like `/auth/forgot-password`) and takes `{ email }` in the
body. This plan corrects the contract doc, changes `AuthClient.resendVerificationEmail`
to accept an email address instead of an access token, and adds a "resend verification
email" action to `LoginPage` that appears when login fails with `EMAIL_NOT_VERIFIED` —
closing the dead-end where a newly registered user with a lost/expired verification
email had no way to request a new one without a session.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 (existing project stack, unchanged)

**Primary Dependencies**: None new — reuses `httpClient.ts`'s `apiFetch`/`ApiError`,
existing `AuthClient`/`AuthContext` pattern.

**Storage**: N/A (stateless request; mock client keeps its existing in-memory
`mockAccounts` map)

**Testing**: Vitest + Testing Library (existing `authClient.mock`/component tests)

**Target Platform**: Web (browser), existing SPA

**Project Type**: Web application (single frontend repo)

**Performance Goals**: N/A — no new performance-sensitive path

**Constraints**: Must not require a session/access token for the resend action from
the login screen (FR-002, FR-004); must not change the existing in-app banner's
observable behavior (FR-006)

**Scale/Scope**: Two files touched for the contract fix
(`docs/api/openapi.yaml`, `authClient.types.ts` + `authClient.real.ts` +
`authClient.mock.ts`), one context wiring change (`AuthProvider.tsx`), one UI change
(`LoginPage.tsx`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Principle II (Spec-Before-Code)**: Satisfied — this plan follows an approved spec
  (`specs/005-fix-resend-verification/spec.md`) generated via `/speckit-specify`.
- **Principle III (Contract & Error Consistency)**: This feature's entire purpose is
  fixing a Contract & Error Consistency violation — `docs/api/openapi.yaml` currently
  disagrees with the real backend's `/auth/resend-verification` behavior. The plan
  brings the doc in line with the real, observed contract (public, `{ email }` body),
  per the principle's rule that `docs/api/openapi.yaml` is authoritative and MUST match
  real behavior. No new error envelope shape is introduced — `RATE_LIMITED` (429) and
  the generic error passthrough already match the existing envelope.
- **Principle IV (Security Non-Negotiables)**: No plaintext credential handling is
  touched. Making the endpoint's public/no-auth nature explicit in the doc does not
  change what data it can act on (it already sends an email, not a password, and only
  triggers a re-send of a link — the backend's own account-enumeration posture is
  unchanged by this frontend-side fix, mirroring `forgot-password`'s existing
  no-enumeration pattern).
- **Principle V (Verified Before Done)**: `oxlint`, `tsc -b && vite build`, and
  `vitest` must pass; the new `LoginPage` resend action must be exercised in a running
  browser (mock backend) before this is reported done.
- **Principle I (Dynamic Form Rendering Integrity)**: Not applicable — this touches
  auth screens only, no template-generation UI.

No violations requiring justification — Complexity Tracking section is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-resend-verification/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── auth-client.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
docs/api/
└── openapi.yaml                              # /auth/resend-verification contract fix

src/features/auth/
├── api/
│   ├── authClient.types.ts                    # resendVerificationEmail(email) signature
│   ├── authClient.real.ts                     # body: { email }, security: []
│   └── authClient.mock.ts                     # mirror new signature + EMAIL_NOT_VERIFIED login sentinel
├── context/
│   ├── AuthContext.ts                          # doc comment update only (still no-arg for banner)
│   └── AuthProvider.tsx                        # resendVerificationEmail() now passes session.email
└── pages/
    ├── LoginPage.tsx                           # new resend action on EMAIL_NOT_VERIFIED
    └── LoginPage.test.tsx                      # existing test file, extended
```

**Structure Decision**: Single frontend project (`how2prompt-ui`), feature-first
layout already in place under `src/features/auth`. No new files — every change is an
edit to an existing file in the auth feature, matching the "prefer editing existing
files" convention and the small blast radius of this fix.

## Complexity Tracking

_No violations — section intentionally empty._
