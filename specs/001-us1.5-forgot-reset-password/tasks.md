---
description: 'Task list for Forgot & Reset Password'
---

# Tasks: Forgot & Reset Password

**Input**: Design documents from `/specs/001-us1.5-forgot-reset-password/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-client.md, quickstart.md (all present)

**Tests**: Included — the existing auth feature has a `*.test.tsx` file per page
(`LoginPage.test.tsx`, `RegisterPage.test.tsx`); this feature follows the same
established convention, and Constitution Principle V requires `vitest` to pass
before the feature is reported done.

**Organization**: This spec has a single user story (US1 — Recover access via
forgotten password, P1), so there is one story phase after Foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: Belongs to User Story 1 (this spec's only story)
- File paths are relative to the repository root

## Path Conventions

Single project, existing feature-first layout — all paths under
`src/features/auth/` and `src/app/`, per `plan.md`'s Project Structure.

---

## Phase 1: Setup

**Purpose**: Project initialization

No setup tasks required — this feature reuses the existing project tooling (Vite,
TypeScript, Vitest, `oxlint`) and introduces no new dependency. Proceed directly to
Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared plumbing that both the mock and real `AuthClient`
implementations depend on — MUST complete before Phase 3 starts.

**⚠️ CRITICAL**: No User Story 1 work can begin until this phase is complete.

- [x] T001 [P] Add a `status: number` field to `ApiError` and populate it from
      `Response.status` inside `apiFetch`'s error branch, in
      `src/features/auth/api/httpClient.ts` (research.md Decision 1)
- [x] T002 [P] Add `PasswordResetRequestOutcome` and `PasswordResetOutcome` types to
      `src/features/auth/api/types.ts` (data-model.md)
- [x] T003 Add `requestPasswordReset(email: string): Promise<PasswordResetRequestOutcome>`
      and `resetPassword(token: string, newPassword: string): Promise<PasswordResetOutcome>`
      to the `AuthClient` interface in `src/features/auth/api/authClient.types.ts`
      (depends on T002 for the imported types; contracts/auth-client.md)

**Checkpoint**: Foundation ready — User Story 1 implementation can now begin.

---

## Phase 3: User Story 1 - Recover access via forgotten password (Priority: P1) 🎯 MVP

**Goal**: A user who forgets their password can request a reset link by email,
follow it, and set a new password to regain account access, without the system ever
revealing whether a submitted email has an account.

**Independent Test**: Submit an email on `/forgot-password`, follow a
(simulated) reset link with a valid token to `/reset-password`, submit a new
password, and confirm login succeeds with the new password.

### Implementation for User Story 1

- [x] T004 [P] [US1] Implement `requestPasswordReset` and `resetPassword` in the mock
      client `src/features/auth/api/authClient.mock.ts` — always resolve `success`
      for a well-formed email; use a fixed sentinel token (e.g. `'expired-token'`) to
      exercise the `RESET_TOKEN_EXPIRED` branch (contracts/auth-client.md "Mock
      implementation notes") — depends on Phase 2
- [x] T005 [P] [US1] Implement `requestPasswordReset` and `resetPassword` in the real
      client `src/features/auth/api/authClient.real.ts` — `POST /auth/forgot-password`
      with `{ email }`, `POST /auth/reset-password` with `{ token, new_password }`;
      map `ApiError.status === 410` to `errorCode: 'RESET_TOKEN_EXPIRED'`
      (contracts/auth-client.md) — depends on Phase 2
- [x] T006 [P] [US1] Create `ForgotPasswordPage` in
      `src/features/auth/pages/ForgotPasswordPage.tsx` — email form using the
      existing `AuthLayout`/`InlineBlank` pattern (research.md Decision 3), calls
      `authClient.requestPasswordReset`. On `status: 'success'`, show one identical
      confirmation message regardless of whether the email matched an account (spec
      FR-002 — both "exists" and "doesn't exist" resolve to `success`, per
      contracts/auth-client.md). On `status: 'error'` (network/unexpected failure),
      show the returned `message` inline instead, same as `LoginPage`/`RegisterPage`
      (spec FR-005) — do NOT collapse this into the generic confirmation — depends
      on T004, T005
- [x] T007 [P] [US1] Create `ResetPasswordPage` in
      `src/features/auth/pages/ResetPasswordPage.tsx` — reads `token` from the URL
      query string, single new-password field with show/hide toggle (research.md
      Decision 2, matching `RegisterPage`'s pattern), client-side min-length
      validation reusing the existing 8-character rule, calls
      `authClient.resetPassword`; on `RESET_TOKEN_EXPIRED` shows an expired-link
      message with a link back to `/forgot-password` (spec FR-003, FR-004); on
      success, redirects to `/login` with a success message — depends on T004, T005
- [x] T008 [P] [US1] Add a "Forgot password?" link from `/login` to
      `/forgot-password` in `src/features/auth/pages/LoginPage.tsx`, next to the
      password field
- [x] T009 [US1] Register the `forgot-password` and `reset-password` routes
      (rendering `ForgotPasswordPage` and `ResetPasswordPage`) under the existing
      `RootLayout` route in `src/app/App.tsx` (research.md Decision 4) — depends on
      T006, T007
- [x] T010 [P] [US1] Write `src/features/auth/pages/ForgotPasswordPage.test.tsx`
      covering Acceptance Scenarios 1–2 (submit known/unknown email → identical
      confirmation message) — depends on T006
- [x] T011 [P] [US1] Write `src/features/auth/pages/ResetPasswordPage.test.tsx`
      covering Acceptance Scenarios 3–5 (valid token success, expired/used token
      message, password-too-short validation) plus the Edge Case "reopening an
      already-used reset link via the browser back button re-validates the token
      from the URL and hits the same expired/used-token path as Scenario 4" —
      depends on T007

**Checkpoint**: User Story 1 is fully functional and independently testable —
this is the entire feature (single-story spec).

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verification gates required before the feature can be reported done
(Constitution Principle V)

- [x] T012 [P] Run `npm run lint` and fix any issues in the changed/new files
- [x] T013 [P] Run `npm run build` (`tsc -b && vite build`) and fix any type errors
- [x] T014 Run `npm run test` and confirm `ForgotPasswordPage.test.tsx` and
      `ResetPasswordPage.test.tsx` pass
- [x] T015 Manually exercise all 5 scenarios in `quickstart.md` in a running browser
      (`npm run dev`) — a passing type-check is not sufficient evidence per
      Constitution Principle V

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — no tasks.
- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS Phase 3.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **Polish (Phase 4)**: Depends on Phase 3 completion.

### Within Phase 3

- T004, T005 (client implementations) before T006, T007 (pages that call them).
- T006, T007 before T009 (routing imports both pages).
- T006 before T010; T007 before T011 (tests target the page they exercise).
- T008 (Login link) is independent of T006/T007/T009 — different file, no shared
  symbol — but logically only useful once `/forgot-password` exists; safe to do in
  any order.

### Parallel Opportunities

- T001, T002 (Phase 2) — different files, no shared dependency.
- T004, T005 (Phase 3) — different files (mock vs. real client).
- T006, T007, T008 (Phase 3) — different files, no shared symbols between them.
- T010, T011 (Phase 3) — different test files.
- T012, T013 (Phase 4) — independent tooling runs.

---

## Parallel Example: Phase 3

```bash
# After Phase 2 completes, launch both client implementations together:
Task: "Implement requestPasswordReset/resetPassword in src/features/auth/api/authClient.mock.ts"
Task: "Implement requestPasswordReset/resetPassword in src/features/auth/api/authClient.real.ts"

# Once T004/T005 land, launch both pages together:
Task: "Create ForgotPasswordPage in src/features/auth/pages/ForgotPasswordPage.tsx"
Task: "Create ResetPasswordPage in src/features/auth/pages/ResetPasswordPage.tsx"
```

---

## Implementation Strategy

### MVP First (and only)

This spec has a single user story, so "MVP" and "complete feature" are the same
scope:

1. Complete Phase 2: Foundational.
2. Complete Phase 3: User Story 1 (T004–T011).
3. Complete Phase 4: Polish (lint, build, tests, manual quickstart validation).
4. **STOP and VALIDATE**: confirm all 5 quickstart.md scenarios pass in a running
   browser before reporting the feature done.

### Relationship to sibling specs

`002-us1.6-verify-email` and `003-us1.7-manage-profile` are separate specs (split
per the project's naming convention) and are NOT blocked by this feature — they were
already independently testable in the original combined spec, and remain so as
separate specs. `002-us1.6-verify-email`'s real-client implementation can reuse this
feature's `ApiError.status` addition (T001) once merged, since `/auth/verify-email`
has the same undocumented-410-error-code situation — worth checking before
duplicating that decision there.

---

## Notes

- [P] tasks = different files, no dependencies.
- [US1] label maps every Phase 3 task to this spec's only user story.
- Commit after each task or logical group, per the repo's "only commit when asked"
  convention — this task list does not imply auto-committing.
- Avoid scope creep: avatar upload, locale-driven UI, and any Epic 2/3 work are out
  of scope per spec.md's Assumptions.
