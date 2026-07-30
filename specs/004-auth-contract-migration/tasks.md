---
description: 'Task list for Auth API Contract Migration (v1.1.0)'
---

# Tasks: Auth API Contract Migration (v1.1.0)

**Input**: Design documents from `/specs/004-auth-contract-migration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-client.md, quickstart.md

**Tests**: Not explicitly requested in spec.md (no TDD ask) — this migration reuses the
existing mock-backed test suite as a regression guard (Constitution Principle V) rather
than writing new tests-first; one new small test is added where a genuinely new
observable behavior (the dead callback route's redirect) has no existing coverage.

**Organization**: Tasks are grouped by user story (spec.md P1/P2/P3) to enable
independent implementation and testing of each.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to the repository root.

## Path Conventions

Single project — `src/features/auth/**`, `src/app/App.tsx`, `.specify/memory/constitution.md`,
`CLAUDE.md`. No `backend/`/`frontend/` split; no new directories introduced.

---

## Phase 1: Setup

**Purpose**: Confirm a clean starting point before touching wire-level code.

- [x] T001 Run `npm run lint`, `npm run test`, and `npm run build` from the repo root and confirm all three are green _before_ any change in this feature, so any later failure is attributable to this migration.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: `httpClient.ts`'s error parsing and response unwrapping are shared by
every endpoint call in every user story below — they must land first.

**⚠️ CRITICAL**: No user story task below can be verified end-to-end until this phase
is complete (field-rename-only edits like T004/T008/T009 don't functionally need T002/T003
first, but running any real or mock request through `apiFetch` does).

- [x] T002 Rename `ApiErrorBody.error.trace_id` to `traceId` in `src/features/auth/api/httpClient.ts` (data-model.md "ErrorResponse").
- [x] T003 Update `apiFetch<T>` in `src/features/auth/api/httpClient.ts` to unwrap the `{ data, meta }` `ApiResponse<T>` envelope before returning `T` to callers (research.md Decision 2; depends on T002, same file).

**Checkpoint**: `httpClient.ts` speaks the new envelope/error shape — user story work can begin.

---

## Phase 3: User Story 1 - Existing account flows keep working (Priority: P1) 🎯 MVP

**Goal**: Register, login, logout, silent refresh, and forgot/reset password all
continue to work unchanged from the user's point of view against the v1.1.0 contract.

**Independent Test**: Run the register → login → refresh → logout journey and the
forgot/reset-password journey (quickstart.md Sections 2–4) and confirm outcomes match
pre-migration behavior.

### Implementation for User Story 1

- [x] T004 [P] [US1] Rename `AuthResponseBody`/`BackendUser` fields in `src/features/auth/api/authClient.real.ts`: `access_token`→`accessToken`, `expires_in`→`expiresIn`, `full_name`→`fullName`, `email_verified`→`emailVerified`; remove `token_type` (no longer part of `AuthResponse` — research.md Decision 1/5).
- [x] T005 [US1] In `src/features/auth/api/authClient.real.ts`, add a helper that fetches `GET /users/me` with a given `accessToken` and a two-argument `toSession(authResponse, userProfile)` that assembles `Session` from both pieces, replacing the old one-argument `toSession(body)` that read `body.user.*` directly (data-model.md "Assembly: Session"; depends on T004).
- [x] T006 [US1] Update `login()` in `src/features/auth/api/authClient.real.ts` to call `POST /auth/login` then the new `GET /users/me` helper, assembling the session via T005's `toSession` (depends on T005).
- [x] T007 [US1] Update `restoreSession()` in `src/features/auth/api/authClient.real.ts` to use the renamed fields and the new two-argument `toSession` helper in place of its current inline `{ ...refreshed, token_type: 'Bearer', user: profile }` construction (depends on T005).
- [x] T008 [P] [US1] Rename `register()`'s request body field `full_name`→`fullName` in `src/features/auth/api/authClient.real.ts`.
- [x] T009 [P] [US1] Rename `resetPassword()`'s request body field `new_password`→`newPassword` in `src/features/auth/api/authClient.real.ts`.
- [x] T010 [US1] Run `npm run test` and confirm `AuthContext.test.tsx`, `LoginPage.test.tsx`, `RegisterPage.test.tsx`, `ForgotPasswordPage.test.tsx`, `ResetPasswordPage.test.tsx` (all mock-client-backed, so unaffected by T004–T009's real-client-only changes) still pass; investigate and fix any incidental breakage (depends on T004, T005, T006, T007, T008, T009).
- [ ] T011 [US1] Manually validate quickstart.md Sections 2–4 (register→login→session, silent refresh, reset-password expired link) in a running browser (depends on T010). **Not run**: no browser-automation tool available in this environment — needs a human (or a session with browser tooling) to complete.

**Checkpoint**: User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 - Google sign-in keeps working under the new flow (Priority: P2)

**Goal**: Google sign-in completes in one step (idToken → backend) instead of the old
authorization-code redirect, and a stale callback URL redirects to `/login`.

**Independent Test**: Complete a Google sign-in end to end and confirm no callback page
is involved; separately visit `/auth/google/callback` directly and confirm redirect to
`/login` (quickstart.md Sections 5–6). **Build-order note**: this story is
independently _testable_, but T013 reuses the `toSession` helper T005 introduces, so
Phase 3 (US1) must be implemented before Phase 4 (US2) even though the two remain
separately verifiable/demoable once both exist.

### Implementation for User Story 2

- [x] T012 [P] [US2] Extend `src/features/auth/api/googleIdentity.ts` so the resolved Google credential (or a new sibling export) also exposes the raw, undecoded ID token string, not just the decoded `{ email, name }` (research.md Decision 3).
- [x] T013 [US2] Rewrite `signInWithGoogle()` in `src/features/auth/api/authClient.real.ts` to obtain the raw ID token via `googleIdentity.ts` and call `POST /auth/oauth/google { idToken }`, assembling the session via T005's two-argument `toSession` helper (depends on T005, T012).
- [x] T014 [US2] Remove `completeGoogleOAuth` and the `authorization_url`/`state` `sessionStorage` bookkeeping (`GOOGLE_OAUTH_STATE_KEY`) from `src/features/auth/api/authClient.real.ts` (depends on T013).
- [x] T015 [P] [US2] Remove `completeGoogleOAuth` from the `AuthClient` interface in `src/features/auth/api/authClient.types.ts` and delete its stub implementation in `src/features/auth/api/authClient.mock.ts`.
- [x] T016 [US2] Delete `src/features/auth/pages/GoogleCallbackPage.tsx` (depends on T014, T015).
- [x] T017 [US2] In `src/app/App.tsx`, remove the `GoogleCallbackPage` import and its route, adding in its place `<Route path="auth/google/callback" element={<Navigate to="/login" replace />} />` (spec Clarifications Q1; depends on T016).
- [x] T018 [P] [US2] Add a route test asserting a visit to `/auth/google/callback` redirects to `/login` in a new `src/app/App.test.tsx` (depends on T017).
- [x] T019 [US2] Run `npm run test` and confirm `GoogleSignInButton.test.tsx` (mock-client-backed) still passes; fix any incidental breakage from the `AuthClient` interface change in T015 (depends on T015).
- [ ] T020 [US2] Manually validate quickstart.md Sections 5–6 (Google sign-in single-step, dead callback route redirect) in a running browser (depends on T017, T019). **Not run**: same environment limitation as T011.

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Email verification keeps working under the new flow (Priority: P3)

**Goal**: Verify-email submits the token in a request body instead of the URL query
string, and resend treats HTTP 202 as success — with identical user-visible outcomes.

**Independent Test**: Open a valid verification link, confirm the account becomes
verified; separately trigger resend and confirm the accepted/rate-limited messaging is
unchanged (quickstart.md Section 7).

### Implementation for User Story 3

- [x] T021 [US3] Change `verifyEmail()` in `src/features/auth/api/authClient.real.ts` from `GET /auth/verify-email?token=<token>` to `POST /auth/verify-email` with body `{ token }` (depends on T003).
- [x] T022 [US3] In `src/features/auth/api/authClient.real.ts`, confirm `resendVerificationEmail()` treats HTTP `202` as success (verify `apiFetch`'s `response.ok` check already covers it; add a short comment noting the contract's `202 Accepted` semantics) (depends on T003).
- [x] T022a [US3] Update the success-message copy in `src/features/auth/components/EmailVerificationBanner.tsx` (line ~31) from "Đã gửi lại email xác minh, hãy kiểm tra hộp thư của bạn." (implies already sent) to wording that reflects the request was accepted/queued, not delivered — per FR-005/US3 Acceptance Scenario 3 (depends on T022).
- [x] T023 [US3] Run `npm run test` and confirm `VerifyEmailPage.test.tsx` passes unmodified, and update `EmailVerificationBanner.test.tsx`'s assertion on the success message text to match T022a's new copy (depends on T021, T022, T022a).
- [ ] T024 [US3] Manually validate quickstart.md Section 7 (verify email, resend, expired link) in a running browser (depends on T023). **Not run**: same environment limitation as T011.

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation upkeep and the final verification gate.

- [x] T025 [P] Amend `.specify/memory/constitution.md` Principle III's error-envelope example from `` `{ error: { code, message, details?, trace_id? } }` `` to `` `{ error: { code, message, details?, traceId? } }` ``, with a new Sync Impact Report entry and version bump `3.0.1` → `3.0.2` (research.md Decision 7, spec Clarifications Q2).
- [x] T026 [P] Update `CLAUDE.md`'s "API & error conventions" Google sign-in description to describe the single-request `idToken` flow (`POST /auth/oauth/google`), removing the authorization-code/redirect/callback description and the now-collapsed mock-vs-real flow distinction it draws.
- [x] T027 Run `npm run lint`, `npm run test`, and `npm run build` as the final Constitution Principle V gate (depends on T010, T019, T023, T025, T026).
- [ ] T028 If a live v1.1.0 backend is reachable, run quickstart.md Section 8 to confirm the `ApiResponse<T>` envelope and the `/users/me` follow-up assumption (research.md Decisions 1–2) against a real response; otherwise record in the PR/notes that this remains unverified against a live backend (depends on T027). **Not run**: no live v1.1.0 backend is reachable from this environment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (every story's
  endpoint calls go through `apiFetch`).
- **User Stories (Phase 3–5)**: All depend on Foundational completion.
  - US1 has no dependency on US2/US3.
  - US2 depends on US1's T005 (`toSession` helper) but is otherwise independent —
    testable on its own per its Independent Test.
  - US3 depends only on Foundational (T003), not on US1/US2.
- **Polish (Phase 6)**: T025/T026 can start any time; T027/T028 depend on every story's
  test/validation tasks being done.

### Within Each User Story

- US1: field renames (T004, T008, T009 — parallel) → session-assembly helper (T005) →
  `login`/`restoreSession` (T006, T007) → regression run (T010) → manual validation
  (T011).
- US2: extend `googleIdentity.ts` (T012, parallel with T004/T008/T009) → real client
  rewrite (T013, T014) → interface/mock cleanup (T015, parallel) → delete page (T016) →
  routing (T017) → route test (T018) → regression run (T019) → manual validation
  (T020).
- US3: both endpoint changes (T021, T022) can be done independently of each other but
  both need T003 → regression run (T023) → manual validation (T024).

### Parallel Opportunities

- T004, T008, T009 (US1 field renames, same file but non-overlapping regions — treat as
  logically parallel edits, verify no merge conflict if actually run concurrently by
  separate agents).
- T012 (US2, different file: `googleIdentity.ts`) can run alongside any US1 task.
- T015 (US2, `authClient.types.ts` + `authClient.mock.ts`) can run alongside T013/T014.
- T018 (new test file) can run alongside T019.
- T025 and T026 (different files, Polish) can run in parallel with each other and with
  any story's later tasks.

---

## Parallel Example: User Story 1

```bash
# Field renames (different regions of the same file — sequence if working solo,
# parallelize only across separate agents/reviewers):
Task: "Rename AuthResponseBody/BackendUser fields in src/features/auth/api/authClient.real.ts"
Task: "Rename register()'s request body field full_name→fullName in src/features/auth/api/authClient.real.ts"
Task: "Rename resetPassword()'s request body field new_password→newPassword in src/features/auth/api/authClient.real.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Extend src/features/auth/api/googleIdentity.ts to expose the raw ID token"
Task: "Remove completeGoogleOAuth from authClient.types.ts and authClient.mock.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run quickstart.md Sections 2–4 against the mock client (and
   the real client if a v1.1.0 backend is reachable).
5. This alone restores full parity for the highest-value, highest-blast-radius flows
   (register/login/session/reset-password) before touching Google sign-in or
   verify-email.

### Incremental Delivery

1. Setup + Foundational → contract-level plumbing ready.
2. Add User Story 1 → validate independently (MVP).
3. Add User Story 2 → validate independently (Google flow is the most structurally
   different change, isolated to its own phase on purpose).
4. Add User Story 3 → validate independently.
5. Polish: constitution/CLAUDE.md doc fixes, final full-suite gate, optional
   real-backend spot check.

### Parallel Team Strategy

With multiple developers, after Foundational (Phase 2) completes:

- Developer A: User Story 1 (T004–T011).
- Developer B: User Story 2 (T012–T020) — only needs T005 from US1 before T013.
- Developer C: User Story 3 (T021–T024) — fully independent of US1/US2.

---

## Notes

- [P] tasks touch different files (or, for T004/T008/T009, different non-overlapping
  regions of the same file) with no completion-order dependency.
- No test-first tasks are included since spec.md did not request TDD; the existing
  mock-backed suite plus one new route test (T018) serve as the regression net,
  per Constitution Principle V.
- Every user story's implementation is confined to `src/features/auth/api/authClient.real.ts`
  and its immediate collaborators (`httpClient.ts`, `googleIdentity.ts`,
  `authClient.types.ts`, `authClient.mock.ts`, `App.tsx`) — no page/component under
  `src/features/auth/pages` or `src/features/auth/components` needs a code change,
  only removal (`GoogleCallbackPage.tsx`) in US2.
- Commit after each task or logical group; stop at any checkpoint to validate a story
  independently before moving to the next.
