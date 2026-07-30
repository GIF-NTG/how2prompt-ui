---
description: 'Task list for Manage Personal Profile (US-1.7)'
---

# Tasks: Manage Personal Profile (US-1.7)

**Input**: Design documents from `/specs/003-us1.7-manage-profile/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-client.md, quickstart.md

**Tests**: Not explicitly requested in spec.md (no TDD ask) — one test file
(`ProfileSettingsPage.test.tsx`) is added covering the spec's acceptance scenarios,
consistent with every other Epic 1 page in this repo having co-located tests.

**Organization**: Single user story (P1) — all implementation tasks live in one
phase; there is no US2/US3 split for this feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (the sole user story)
- Paths are relative to the repository root.

## Path Conventions

Single project — `src/features/auth/**`, `src/app/App.tsx`,
`src/app/layout/RootLayout.tsx`. No new directories.

---

## Phase 1: Setup

- [x] T001 Run `npm run lint`, `npm run test`, and `npm run build` from the repo root and confirm all three are green _before_ any change in this feature.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared types and `AuthClient` interface both the mock and real
implementations (and the page itself) depend on.

**⚠️ CRITICAL**: No implementation task below can compile until this phase is complete.

- [x] T002 Add `UserProfile`, `UpdateProfileInput`, `ProfileOutcome` types to `src/features/auth/api/types.ts` (data-model.md).
- [x] T003 Add `getProfile(accessToken)` and `updateProfile(accessToken, input)` to the `AuthClient` interface in `src/features/auth/api/authClient.types.ts` (contracts/auth-client.md; depends on T002).

**Checkpoint**: Types and interface exist — mock/real implementation can begin.

---

## Phase 3: User Story 1 - Manage personal profile (Priority: P1) 🎯 MVP

**Goal**: A logged-in user can view and edit their full name, username, bio, and
locale from a settings page, with the top-bar name updating immediately on save.

**Independent Test**: Open `/profile` while logged in, change the display name and
locale, save, and confirm the change persists across a page reload and appears in
the top bar immediately (quickstart.md Sections 2–6).

### Implementation for User Story 1

- [x] T004 [P] [US1] Add `username: string | null`, `bio: string | null`, `locale: 'en' | 'vi'` fields to `MockAccountRecord` in `src/features/auth/api/authClient.mock.ts`, with sensible defaults (`locale: 'vi'`, `username`/`bio` `null`) for the seeded demo account and any newly registered mock account (data-model.md "Mock implementation notes"; depends on T002).
- [x] T005 [US1] Implement `getProfile(accessToken)` in `src/features/auth/api/authClient.mock.ts` — resolve the account matching the session persisted under that token (same lookup pattern as `resendVerificationEmail`/`verifyEmail`), mapped to `UserProfile` (depends on T004).
- [x] T006 [US1] Implement `updateProfile(accessToken, input)` in `src/features/auth/api/authClient.mock.ts` — if `input.username` is non-null and already used by a _different_ mock account, resolve `{ status: 'error', errorCode: 'USERNAME_TAKEN', message }` without mutating; otherwise update the record's four fields in place and resolve `{ status: 'success', profile }` (depends on T004).
- [x] T007 [P] [US1] Implement `getProfile(accessToken)` in `src/features/auth/api/authClient.real.ts` — `GET /users/me` with `Authorization: Bearer <accessToken>`, mapping the response onto `UserProfile` (depends on T003).
- [x] T008 [US1] Implement `updateProfile(accessToken, input)` in `src/features/auth/api/authClient.real.ts` — `PATCH /users/me` with body `input`; `error.status === 409` → `USERNAME_TAKEN`; otherwise the backend's actual `error.code`/`message` via the existing `toErrorOutcome` helper (depends on T007).
- [x] T009 [US1] Add `getProfile()`/`updateProfile(input)` to `AuthContext.ts`'s interface and implement both in `AuthProvider.tsx` — both read `session.token` internally (invariant, not defended against `session === null`); `updateProfile`'s success path also calls `setSession({ ...session, displayName: outcome.profile.fullName })` (contracts/auth-client.md; depends on T005, T006, T007, T008).
- [x] T010 [US1] Create `src/features/auth/pages/ProfileSettingsPage.tsx`: read both `session` and `isRestoring` from `useAuth()` — while `isRestoring` is `true`, render nothing/a loading state (do NOT redirect yet); once `isRestoring` is `false`, redirect to `/login` via `<Navigate to="/login" replace />` only if `session` is still `null` (research.md Decision 6 — this guards against incorrectly redirecting an already-logged-in user during a page reload/direct navigation while the real backend's session restore is still in flight); on mount (once a session exists) call `getProfile()` to prefill the form; client-side validation (`fullName` required, max 150 chars; `username` optional, max 50 chars, blank allowed); on submit call `updateProfile()`; show an inline error under the username field for `USERNAME_TAKEN` without discarding other unsaved field values; show a success confirmation on save (depends on T009).
- [x] T011 [US1] Add `<Route path="profile" element={<ProfileSettingsPage />} />` in `src/app/App.tsx` (depends on T010).
- [x] T012 [P] [US1] Add a "Hồ sơ" link to the existing top-bar in `src/app/layout/RootLayout.tsx`, next to the display name and "Đăng xuất" button, pointing to `/profile` (touches a different file than T011, no import dependency on it — can run in parallel; depends only on T010).
- [x] T013 [P] [US1] Write `src/features/auth/pages/ProfileSettingsPage.test.tsx` covering: prefilled form (Acceptance 1), successful save reflected in top bar (Acceptance 2), duplicate-username inline error preserving other fields (Acceptance 3), length-validation blocking submission (Acceptance 4), blank username allowed (Edge Case), redirect-to-`/login` when logged out, and — by forcing `isRestoring: true` initially (e.g. a test-only `AuthContext` provider stub) — that the page does NOT redirect while a restore is still in flight, only after it settles with no session (depends on T010, T011).
- [x] T014 [US1] Run `npm run test` and confirm the new test file passes and no existing test regresses (depends on T013).
- [ ] T015 [US1] Manually validate quickstart.md Sections 2–6 in a running browser (depends on T014). **Not run**: no browser-automation tool available in this environment — needs a human (or a session with browser tooling) to complete.

**Checkpoint**: User Story 1 fully functional and independently testable.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T016 Run `npm run lint`, `npm run test`, and `npm run build` as the final Constitution Principle V gate (depends on T014).
- [ ] T017 If a live backend with a working `GET`/`PATCH /users/me` is reachable, run quickstart.md Section 7 (reload-on-`/profile` race check — validates the H1/`isRestoring` fix against a real async session restore, which the mock can't exercise); otherwise record that this remains blocked by the already-reported `/users/me` 404 gap (see plan.md's "Known live-backend caveat") (depends on T016). **Not run**: no live backend with a working `/users/me` is reachable from this environment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all implementation tasks
  (T004–T013 all reference the types/interface from T002/T003).
- **User Story 1 (Phase 3)**: Depends on Foundational completion. Single story, no
  cross-story dependencies to manage.
- **Polish (Phase 4)**: Depends on Phase 3 completion.

### Within User Story 1

- Mock path: T004 → T005/T006 (parallel with each other) → feeds T009.
- Real path: T007 → T008 → feeds T009 (independent of the mock path — T007 can run
  alongside T004).
- T009 (AuthContext/AuthProvider) needs both paths done, since it's implemented
  against the (mock-or-real-selected) `authClient`, not against one implementation
  directly.
- T010 (page) → T011 (route) and T012 (nav link) (parallel — different files, T012
  doesn't depend on T011 actually landing first) → T013 (tests) → T014 (regression
  run) → T015 (manual validation).

### Parallel Opportunities

- T004 (mock) and T007 (real) touch different files and can run in parallel once
  T002/T003 land.
- T005 and T006 (both mock, same file but non-overlapping methods) can be treated
  as parallel edits across separate agents/reviewers.
- T011 (`App.tsx`) and T012 (`RootLayout.tsx`) touch different files with no
  import dependency between them and can run in parallel once T010 lands.

---

## Parallel Example: User Story 1

```bash
Task: "Implement getProfile/updateProfile in src/features/auth/api/authClient.mock.ts"
Task: "Implement getProfile/updateProfile in src/features/auth/api/authClient.real.ts"
```

---

## Implementation Strategy

### MVP First (and Only) Scope

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — blocks everything).
3. Complete Phase 3: User Story 1 (the entire feature — there is only one story).
4. **STOP and VALIDATE**: run quickstart.md Sections 2–6 against the mock client.
5. Complete Phase 4: Polish (final gate + backend-availability check).

### Parallel Team Strategy

With two developers, after Foundational (Phase 2) completes:

- Developer A: mock implementation (T004–T006).
- Developer B: real implementation (T007–T008).
- Either developer then continues with AuthContext wiring (T009) once both land.

---

## Notes

- [P] tasks touch different files with no completion-order dependency.
- No test-first tasks are included since spec.md did not request TDD; a single new
  test file (T013) serves as the regression net for this feature, per Constitution
  Principle V.
- This feature's frontend implementation is not blocked by the known
  `GET /users/me` 404 on the live backend — it's built and tested against
  `authClient.mock.ts` like every other Epic 1 story. Only T017 (real-backend
  spot check) is affected.
- Commit after each task or logical group; stop at the Phase 3 checkpoint to
  validate the (only) story independently before moving to Polish.
