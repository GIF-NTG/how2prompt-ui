---
description: 'Task list for Fix Resend-Verification Contract & Add Login-Screen Resend Action'
---

# Tasks: Fix Resend-Verification Contract & Add Login-Screen Resend Action

**Input**: Design documents from `/specs/005-fix-resend-verification/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-client.md, quickstart.md

**Tests**: Included — the feature's own spec success criteria (SC-003) requires
existing banner test coverage to keep passing, and this repo's constitution
(Principle V) requires `vitest` to pass before a change is reported done, so
`LoginPage.test.tsx` gets new cases and `EmailVerificationBanner.test.tsx` is
re-verified unchanged.

**Organization**: Tasks are grouped by user story per spec.md (US1 = P1 login-screen
resend action, US2 = P2 existing banner non-regression), with a shared Foundational
phase for the underlying contract/client fix both stories build on.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

## Path Conventions

Single frontend project — all paths relative to repository root
(`D:\WorkSpace\Github Clone Vô Đây\how2prompt-ui`).

---

## Phase 1: Setup

No new setup required — this feature only edits existing files in an already
scaffolded feature area (`src/features/auth`). Phase intentionally empty.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix the contract mismatch and change `AuthClient.resendVerificationEmail`'s
signature — both user stories depend on this being correct before their own work can
be verified.

**⚠️ CRITICAL**: No user story task can be completed until this phase is done.

- [x] T001 Update `docs/api/openapi.yaml`'s `/auth/resend-verification` path: add
      `security: []` and a `requestBody` requiring `{ email: string }`, matching
      `/auth/forgot-password`'s existing shape (see contracts/auth-client.md's "Contract
      doc changes" section for the exact YAML).
- [x] T002 In the same file, extend `/auth/login`'s documented `401` response to note
      `EMAIL_NOT_VERIFIED` as a possible `error.code` alongside the already-documented
      `INVALID_CREDENTIALS` (spec.md FR-008; data-model.md; research.md Decision 4) — no
      schema change, documentation/example only.
- [x] T003 Change `resendVerificationEmail`'s signature in
      `src/features/auth/api/authClient.types.ts` from `(accessToken: string)` to
      `(email: string)`, updating its doc comment to describe the public/no-auth,
      email-body request (contracts/auth-client.md).
- [x] T004 Update `src/features/auth/api/authClient.real.ts`'s
      `resendVerificationEmail` implementation: call
      `apiFetch<void>('/auth/resend-verification', { method: 'POST', body: { email } })`
      with no `accessToken`, keeping the existing `RATE_LIMITED` (429) branch and generic
      fallback unchanged.
- [x] T005 Update `src/features/auth/api/authClient.mock.ts`'s
      `resendVerificationEmail` implementation to accept `email` directly and look up the
      matching `MockAccountRecord` in `mockAccounts` by that email (instead of resolving
      the account via the currently stored session), keeping the existing
      `lastVerificationSentAt`/`MOCK_RESEND_COOLDOWN_MS` rate-limit logic unchanged
      (data-model.md).
- [x] T006 In the same file, update `login(email, password)` so that when the
      submitted credentials match a stored account whose `emailVerified` is `false`, it
      resolves `{ status: 'error', errorCode: 'EMAIL_NOT_VERIFIED', message: '...' }`
      instead of the current unconditional success on password match (research.md
      Decision 5); verified accounts (including the seeded demo account) are unaffected.
- [x] T007 Update `src/features/auth/context/AuthProvider.tsx`'s
      `resendVerificationEmail()` to call `authClient.resendVerificationEmail(session!.email)`
      instead of `authClient.resendVerificationEmail(session!.token)` — no change to its
      own no-argument public signature (contracts/auth-client.md).
- [x] T008 [P] Update the doc comment on `resendVerificationEmail` in
      `src/features/auth/context/AuthContext.ts` to reflect that it now reads
      `session.email` internally instead of `session.token`.

**Checkpoint**: Contract, client, and mock all agree on the new email-based shape.
`npm run build` (TypeScript) should pass with no other files needing changes yet.

---

## Phase 3: User Story 1 - Unverified user recovers from login via resend action (Priority: P1) 🎯 MVP

**Goal**: A user whose login fails with `EMAIL_NOT_VERIFIED` sees and can use a
"resend verification email" action directly on the login screen, with no session
required.

**Independent Test**: Register a new (unverified) mock account, attempt to log in
with its correct credentials, confirm the resend action appears, activate it, and
confirm the success/rate-limited outcomes render in place.

### Tests for User Story 1

- [x] T009 [P] [US1] Add a test in `src/features/auth/pages/LoginPage.test.tsx`:
      register an unverified account via `authClient.register(...)`, attempt login with
      its credentials, and assert a "resend verification email" action becomes visible
      alongside the failure message (following the existing `renderLoginPage()` +
      `userEvent` pattern already in this file).
- [x] T010 [P] [US1] Add a test in the same file: activate the resend action and
      assert a success/confirmation message appears, using
      `authClient.resendVerificationEmail` spied or the mock's natural cooldown behavior
      to also assert a second immediate activation shows the rate-limited message
      (Acceptance Scenarios 2–3).
- [x] T011 [P] [US1] Add a test in the same file asserting the resend action is
      **absent** after a login failure for a wrong password on a verified account (e.g.
      the seeded demo account) — Acceptance Scenario 4.

### Implementation for User Story 1

- [x] T012 [US1] In `src/features/auth/pages/LoginPage.tsx`, add local state to track
      whether the last failed login's `errorCode` was `'EMAIL_NOT_VERIFIED'` and to hold
      the resend action's own status/error message, mirroring
      `EmailVerificationBanner.tsx`'s `sending`/`statusMessage`/`errorMessage` state shape.
- [x] T013 [US1] In the same file's `handleSubmit`, when `authClient.login(...)`
      resolves `{ status: 'error', errorCode: 'EMAIL_NOT_VERIFIED', message }`, set that
      new state instead of (or in addition to) the existing generic `errorMessage` display.
- [x] T014 [US1] In the same file, render a "resend verification email" button next to
      the failure message when the `EMAIL_NOT_VERIFIED` state is set; clicking it calls
      `authClient.resendVerificationEmail(trimmedEmail)` (the same `trimmedEmail` already
      computed in `handleSubmit`) and displays the outcome using the same
      `role="status"` / `role="alert"` pattern `EmailVerificationBanner.tsx` already uses,
      including a disabled/cooldown state on `RATE_LIMITED` (contracts/auth-client.md).
- [x] T015 [US1] Ensure the resend action and its state reset whenever the email
      field changes or a new login attempt is submitted, so a stale resend action from a
      previous failed attempt doesn't linger against a newly typed email (spec.md Edge
      Cases).

**Checkpoint**: User Story 1 is independently functional — `npm run test` passes for
`LoginPage.test.tsx`, and the flow is reachable end-to-end against the mock backend.

---

## Phase 4: User Story 2 - Already-authenticated user can still resend from the in-app banner (Priority: P2)

**Goal**: Non-regression — `EmailVerificationBanner`'s existing resend behavior is
unchanged after the `AuthClient`/`AuthContext` signature change.

**Independent Test**: Run `EmailVerificationBanner.test.tsx` unchanged and confirm
every existing assertion still passes.

### Tests for User Story 2

- [x] T016 [P] [US2] Run the existing
      `src/features/auth/components/EmailVerificationBanner.test.tsx` suite as-is (no
      test file changes expected) and confirm all cases still pass after Phase 2's
      changes — this is the acceptance check for FR-006, not new test authoring.
      Result: all 3 existing tests pass unchanged.

### Implementation for User Story 2

- [x] T017 [US2] Not needed — T016 passed with no failures, so no fix was required in
      `AuthProvider.tsx`/`authClient.mock.ts`, and `EmailVerificationBanner.tsx` itself
      was not touched (data-model.md).

**Checkpoint**: Both user stories work independently; the banner's behavior is
provably unchanged.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T018 [P] Run `npm run lint` and fix any findings across all files touched in
      Phases 2–4. Result: clean, no findings.
- [x] T019 [P] Run `npm run build` (`tsc -b && vite build`) and fix any type errors.
      Result: build succeeds.
- [x] T020 Run `npm run test` and confirm the full suite passes, including T009–T011,
      T016, and every other existing auth test file. Result: 11 files / 36 tests, all
      passing (one pre-existing test, `ProfileSettingsPage.test.tsx`'s Acceptance 3, had
      to be updated — it registered+logged-in a throwaway second account to seed a taken
      username, which broke once login correctly started rejecting unverified accounts;
      fixed by seeding that account's session directly, the same technique
      `EmailVerificationBanner.test.tsx` already used, instead of going through login).
- [ ] T021 Manually execute `quickstart.md` scenarios 2–5 against `npm run dev` (mock
      backend) in a running browser — **NOT completed**: no browser-driving tool is
      available in this environment/session, so this step could not be executed. The dev
      server was started and confirmed to boot cleanly (`vite` ready, no console errors),
      but the login screen's resend action was not visually exercised in a real browser.
      This should be done manually before merging, per Constitution Principle V.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no blocker.
- **Foundational (Phase 2)**: No dependencies — BLOCKS both user stories (T001–T008
  must all complete first).
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion only.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion only; independent of
  Phase 3 (can run in parallel with it).
- **Polish (Phase 5)**: Depends on Phases 2–4 all being complete.

### Within Phase 2

- T001, T002 (docs) can run in parallel with each other and with T003–T008 (no file
  overlap).
- T003 (type signature) should land before T004/T005 (implementations that use the
  new signature), though in practice all three can be authored together since
  TypeScript will flag any mismatch.
- T007 depends on T003/T004/T005 (needs the new signature to exist).
- T008 [P] is independent (doc-comment-only edit).

### Within Phase 3

- T009–T011 (tests) should be written before T012–T015 (implementation), per this
  repo's "write tests first" convention where tests are included.
- T012 → T013 → T014 → T015 are sequential (same file, same function areas).

### Within Phase 4

- T016 has no dependencies beyond Phase 2. T017 only runs if T016 fails.

---

## Parallel Example: Phase 2 (Foundational)

```bash
Task: "Update docs/api/openapi.yaml's /auth/resend-verification security + requestBody"
Task: "Update docs/api/openapi.yaml's /auth/login 401 response to note EMAIL_NOT_VERIFIED"
Task: "Update the doc comment on AuthContext.resendVerificationEmail"
```

## Parallel Example: Phase 3 (User Story 1 tests)

```bash
Task: "Add LoginPage test: resend action appears on EMAIL_NOT_VERIFIED"
Task: "Add LoginPage test: resend action success + rate-limited outcomes"
Task: "Add LoginPage test: resend action absent for other login failures"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (contract + client + mock fix).
2. Complete Phase 3: User Story 1 (the actual dead-end fix).
3. **STOP and VALIDATE**: Run `quickstart.md` scenarios 2–4 in the browser.
4. This alone resolves the spec's primary success criterion (SC-001).

### Incremental Delivery

1. Foundational → both stories unblocked.
2. User Story 1 → validate independently → this is the MVP.
3. User Story 2 (non-regression check) → confirm no fallout, likely no additional
   code needed beyond Phase 2.
4. Polish → lint/build/test/manual browser pass, per Constitution Principle V.

---

## Notes

- [P] tasks touch different files or non-overlapping regions of the same file.
- No new files are created by this feature — every task edits an existing file.
- Commit after each phase or logical group, per this repo's "only commit when asked"
  convention (the user will decide when to commit, not the agent automatically).
