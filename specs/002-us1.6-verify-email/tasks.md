---
description: 'Task list for Verify Email (+ Resend)'
---

# Tasks: Verify Email (+ Resend)

**Input**: Design documents from `/specs/002-us1.6-verify-email/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-client.md, quickstart.md (all present)

**Tests**: Included — the existing auth feature has a `*.test.tsx` file per page/
component (`LoginPage.test.tsx`, `ForgotPasswordPage.test.tsx`, etc.); this feature
follows the same established convention, and Constitution Principle V requires
`vitest` to pass before the feature is reported done.

**Organization**: This spec has a single user story (US1 — Verify email address,
P1), so there is one story phase after Foundational.

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

**Purpose**: Shared type/contract plumbing that both the mock and real `AuthClient`
implementations depend on — MUST complete before Phase 3 starts.

**⚠️ CRITICAL**: No User Story 1 work can begin until this phase is complete.

- [x] T001 [P] Add `emailVerified: boolean` to `Session`, plus new
      `VerifyEmailOutcome` and `ResendVerificationOutcome` types, in
      `src/features/auth/api/types.ts` (data-model.md)
- [x] T002 Add `verifyEmail(token: string): Promise<VerifyEmailOutcome>` and
      `resendVerificationEmail(accessToken: string): Promise<ResendVerificationOutcome>`
      to the `AuthClient` interface in `src/features/auth/api/authClient.types.ts`
      (depends on T001 for the imported types; contracts/auth-client.md)

**Checkpoint**: Foundation ready — User Story 1 implementation can now begin.

---

## Phase 3: User Story 1 - Verify email address (Priority: P1) 🎯 MVP

**Goal**: A newly registered user verifies their email via a link sent at signup so
their account is fully activated, sees a persistent reminder until then, and can
request the link again if it expires or gets lost.

**Independent Test**: Register a new (unverified) account, confirm the reminder
banner appears on an authenticated page, open a verification link with a valid
token, and confirm the banner disappears on the next authenticated page view.

### Implementation for User Story 1

- [x] T003 [P] [US1] Implement `verifyEmail` and `resendVerificationEmail` in the
      mock client `src/features/auth/api/authClient.mock.ts` — add
      `emailVerified: boolean` to `MockAccountRecord` (`false` for newly registered
      accounts, `true` for the seeded demo account); use a fixed sentinel token
      (e.g. `'expired-token'`) to exercise the `VERIFY_TOKEN_EXPIRED` branch, and an
      in-memory `lastSentAt` timestamp per account to exercise the `RATE_LIMITED`
      branch on a rapid second call (contracts/auth-client.md "Mock implementation
      notes") — depends on Phase 2
- [x] T004 [P] [US1] Implement `verifyEmail` and `resendVerificationEmail` in the
      real client `src/features/auth/api/authClient.real.ts` — extend the
      `BackendUser` interface with `email_verified: boolean` and update `toSession()`
      to map it onto `Session.emailVerified` (research.md Decision 1);
      `GET /auth/verify-email?token=...` (no `Authorization` header — endpoint is
      `security: []`), `POST /auth/resend-verification` with
      `Authorization: Bearer <accessToken>`; map `ApiError.status === 410` to
      `errorCode: 'VERIFY_TOKEN_EXPIRED'` and `ApiError.status === 429` to
      `errorCode: 'RATE_LIMITED'` (contracts/auth-client.md) — depends on Phase 2
- [x] T005 [US1] Add `resendVerificationEmail(): Promise<ResendVerificationOutcome>`
      and `verifyEmail(token: string): Promise<VerifyEmailOutcome>` to the
      `AuthContext` value type in `src/features/auth/context/AuthContext.tsx`, and
      implement both in `src/features/auth/context/AuthProvider.tsx` —
      `resendVerificationEmail()` forwards `session.token` to
      `authClient.resendVerificationEmail`; `verifyEmail(token)` forwards to
      `authClient.verifyEmail`, and on success re-runs `authClient.restoreSession()`
      and updates `session` if one is currently held (research.md Decision 4) —
      depends on T003, T004
- [x] T006 [P] [US1] Create `EmailVerificationBanner` in
      `src/features/auth/components/EmailVerificationBanner.tsx` — a persistent
      banner with a "resend email" action; on click, calls
      `useAuth().resendVerificationEmail()`, shows a confirmation message on
      success and a friendly "please wait" message (not raw error text) on
      `errorCode: 'RATE_LIMITED'` (spec FR-003), and disables the action with a
      visible 5-minute countdown in local component state (research.md Decision 5)
      — depends on T005
- [x] T007 [P] [US1] Create `VerifyEmailPage` in
      `src/features/auth/pages/VerifyEmailPage.tsx` — reads `token` from the URL
      query string via `useSearchParams` (same pattern as `ResetPasswordPage`),
      calls `useAuth().verifyEmail(token)` on mount; on
      `errorCode: 'VERIFY_TOKEN_EXPIRED'` shows a clear "link expired" message with
      a way to request a new one (spec FR-005); on success shows a "verified"
      confirmation. Must render and complete the flow whether or not a session is
      currently held (spec Edge Case: works without an active session) — depends on
      T005
- [x] T008 [US1] Render `EmailVerificationBanner` from
      `src/app/layout/RootLayout.tsx` when `session && !session.emailVerified` (spec
      FR-001) — depends on T006
- [x] T009 [US1] Register the `verify-email` route (rendering `VerifyEmailPage`)
      under the existing `RootLayout` route in `src/app/App.tsx` — depends on T007
- [x] T010 [P] [US1] Write
      `src/features/auth/components/EmailVerificationBanner.test.tsx` covering
      Acceptance Scenarios 1–3 (banner renders reminder + resend action, resend
      shows confirmation + disables with countdown, rate-limited resend shows a
      friendly message) — depends on T006
- [x] T011 [P] [US1] Write `src/features/auth/pages/VerifyEmailPage.test.tsx`
      covering Acceptance Scenario 4 (valid token marks account verified),
      Acceptance Scenario 5 (expired/already-used token shows the expired-link
      message), and both Edge Cases (works with no active session; a re-opened
      already-used link via back button re-validates from the URL and hits the same
      expired path) — depends on T007

**Checkpoint**: User Story 1 is fully functional and independently testable — this
is the entire feature (single-story spec).

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verification gates required before the feature can be reported done
(Constitution Principle V)

- [x] T012 [P] Run `npm run lint` and fix any issues in the changed/new files
- [x] T013 [P] Run `npm run build` (`tsc -b && vite build`) and fix any type errors
- [x] T014 Run `npm run test` and confirm `EmailVerificationBanner.test.tsx` and
      `VerifyEmailPage.test.tsx` pass
- [x] T015 Manually exercise all 6 scenarios in `quickstart.md` in a running browser
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

- T003, T004 (client implementations) before T005 (context actions wrap them).
- T005 before T006, T007 (banner/page call the context actions, not `authClient`
  directly).
- T006 before T008 (RootLayout renders the banner); T007 before T009 (route renders
  the page).
- T006 before T010; T007 before T011 (tests target the component/page they exercise).

### Parallel Opportunities

- T001 (Phase 2) has no sibling — T002 depends on it directly, so Phase 2 is
  effectively sequential this time (unlike `001`'s two independent Phase 2 tasks).
- T003, T004 (Phase 3) — different files (mock vs. real client).
- T006, T007 (Phase 3) — different files, no shared symbols between them.
- T010, T011 (Phase 3) — different test files.
- T012, T013 (Phase 4) — independent tooling runs.

---

## Parallel Example: Phase 3

```bash
# After Phase 2 completes, launch both client implementations together:
Task: "Implement verifyEmail/resendVerificationEmail in src/features/auth/api/authClient.mock.ts"
Task: "Implement verifyEmail/resendVerificationEmail in src/features/auth/api/authClient.real.ts"

# Once T005 lands, launch the banner and the page together:
Task: "Create EmailVerificationBanner in src/features/auth/components/EmailVerificationBanner.tsx"
Task: "Create VerifyEmailPage in src/features/auth/pages/VerifyEmailPage.tsx"
```

---

## Implementation Strategy

### MVP First (and only)

This spec has a single user story, so "MVP" and "complete feature" are the same
scope:

1. Complete Phase 2: Foundational.
2. Complete Phase 3: User Story 1 (T003–T011).
3. Complete Phase 4: Polish (lint, build, tests, manual quickstart validation).
4. **STOP and VALIDATE**: confirm all 6 quickstart.md scenarios pass in a running
   browser before reporting the feature done.

### Relationship to sibling specs

`001-us1.5-forgot-reset-password` is already merged/implemented and is not touched by
this feature except by reference (its `ApiError.status` field from Decision 1 is
reused as-is — no changes to `httpClient.ts` in this feature).
`003-us1.7-manage-profile` remains a separate, independently testable spec — not
blocked by this feature and does not block it.

---

## Notes

- [P] tasks = different files, no dependencies.
- [US1] label maps every Phase 3 task to this spec's only user story.
- Commit after each task or logical group, per the repo's "only commit when asked"
  convention — this task list does not imply auto-committing.
- Avoid scope creep: this feature only wires the already-deployed
  `/auth/verify-email` and `/auth/resend-verification` endpoints — no backend work,
  no Epic 2/3 work.
