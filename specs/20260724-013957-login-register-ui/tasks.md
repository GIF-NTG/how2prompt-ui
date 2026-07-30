---
description: 'Task list for Login & Register UI (API-ready)'
---

# Tasks: Login & Register UI (API-ready)

**Input**: Design documents from `specs/20260724-013957-login-register-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-client.md, quickstart.md (all present)

**Tests**: Included — the repo already establishes a testing convention
(`HomePage.test.tsx` via Vitest + Testing Library), and the project's
`test-coverage-standards.md` targets ≥70% line+branch coverage on AI-generated
modules, so each story adds its own tests rather than deferring them.

**Organization**: Tasks are grouped by user story (spec.md) so each story is an
independently testable increment. Story phases are ordered by priority
(P1 → P2 → P2 → P3), matching spec.md's US1, US2, US4, US3 order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps the task to its user story (US1/US2/US3/US4)
- File paths are exact and repo-relative

## Path Conventions

Frontend-only, feature-first (see plan.md Project Structure):
`src/features/auth/{pages,components,api,context}`, `src/shared/hooks`,
`src/app/App.tsx`. No `backend/`/`frontend/` split — this repo is the frontend only.

---

## Phase 1: Setup

**Purpose**: Create the empty directories this feature's files will live in. No new
dependencies are required (React Router, Tailwind, Vitest, Testing Library are
already installed per `package.json`).

- [x] T001 Create the feature directory skeleton: `src/features/auth/pages/`,
      `src/features/auth/components/`, `src/features/auth/api/`,
      `src/features/auth/context/` (empty dirs, per plan.md Project Structure)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared contract, state, and interaction primitives every user story
depends on. No story-specific auth _behavior_ (login/register/Google logic) is
implemented yet — only the seams the stories will fill in.

**⚠️ CRITICAL**: No user story task may start until this phase is complete.

- [x] T002 [P] Define `Account`, `Session`, `AuthOutcome`, `AuthErrorCode` types in
      `src/features/auth/api/types.ts` per data-model.md
- [x] T003 Define the `AuthClient` interface (`login`, `register`,
      `signInWithGoogle`, `logout`, `restoreSession`) and a stub
      `createMockAuthClient()` in `src/features/auth/api/authClient.mock.ts` whose
      methods return/throw clearly-marked "not yet implemented" placeholders — this
      establishes the single integration point (FR-009) before any story fills in
      behavior. Depends on T002.
      _Implementation note: the `AuthClient` interface itself lives in
      `src/features/auth/api/authClient.types.ts` (not the mock file), so a future
      `authClient.real.ts` can implement it without importing from the mock module._
- [x] T004 Re-export the active implementation as the single integration point in
      `src/features/auth/api/authClient.ts`
      (`export const authClient = createMockAuthClient()`), per
      contracts/auth-client.md. Depends on T003.
- [x] T005 [P] Implement the shared auto-resize measuring hook
      `useAutoResizeBlank` (hidden-span technique per Constitution Principle I /
      `agent/BA.md` §4.3) in `src/shared/hooks/useAutoResizeBlank.ts`
- [x] T006 Implement `AuthContext` (`AuthProvider`, `useAuth()`): calls
      `authClient.restoreSession()` on mount, exposes `session`, `signIn(session)`,
      and `signOut()` that delegate session persistence to `authClient`, in
      `src/features/auth/context/{AuthContext.ts,AuthProvider.tsx,useAuth.ts}`.
      Depends on T004.
      _Implementation note: split into 3 files (context object, provider component,
      hook) instead of 1, to satisfy the `react/only-export-components` lint rule
      (fast-refresh) — same public API as planned, just file layout._
- [x] T007 Wrap the app in `AuthProvider` and add `/login` and `/register` routes
      (rendering placeholder elements for now) in `src/app/App.tsx`. Depends on T006.
- [x] T008 [P] Implement the shared `InlineBlankForm` presentational component
      (renders a sentence with `useAutoResizeBlank`-backed inline inputs; supports
      Tab/Shift+Tab order; on a submit attempt with empty required blanks, blocks,
      applies a red-highlight class, and autofocuses the first empty blank per
      FR-004/FR-006) in `src/features/auth/components/InlineBlankForm.tsx`.
      Depends on T005.
- [x] T009 [P] Add a "Tiếp tục với vai trò Khách" link (dismisses authentication and
      navigates back to `/`) to the shared auth layout, satisfying FR-015 — rendered
      on both `LoginPage` and `RegisterPage`, in
      `src/features/auth/components/GuestContinueLink.tsx`. Depends on T007.

**Checkpoint**: Routes exist, session state is wired, the single auth integration
point exists (not yet behaviorally complete), and the inline-blank primitive plus
the guest-continue link are ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Returning member signs in (Priority: P1) 🎯 MVP

**Goal**: A visitor can sign in through the Login view against the mock, see a
signed-in state, sign out, see an invalid-credentials message, and have empty
required blanks blocked — fully working end-to-end without any real backend.

**Independent Test**: Open `/login`, submit the mock's known-valid demo credentials
→ signed-in state appears in the nav; submit anything else → inline
"Email hoặc mật khẩu không chính xác"; submit with the password blank empty →
blocked, focused, no call made.

- [x] T010 [US1] Implement `login(email, password)` in
      `src/features/auth/api/authClient.mock.ts`: known-valid demo credentials →
      `{ status: 'success', session, accountCreated: false }`; anything else →
      `{ status: 'error', errorCode: 'INVALID_CREDENTIALS', message: 'Email hoặc mật
  khẩu không chính xác' }`, per contracts/auth-client.md. Depends on T003.
      _Demo credentials: `demo@how2prompt.dev` / `demo1234` (documented here since no
      other artifact pinned a concrete value — see spec-analysis finding C1)._
- [x] T011 [US1] Build `LoginPage` using `InlineBlankForm` and
      `GuestContinueLink` (email + password blanks in a sentence), with pre-submit
      validation blocking empty blanks (FR-006) and malformed email (FR-007),
      calling `authClient.login` via `AuthContext.signIn` on submit, and rendering
      the inline error message on failure, in
      `src/features/auth/pages/LoginPage.tsx`. Depends on T008, T009, T010.
      _Revised for 100% parity with the approved auth mockup: added
      `src/features/auth/components/AuthLayout.tsx` (top bar with brand mark +
      `GuestContinueLink`, two-column panel — product context on the left,
      Login/Register tabs + form on the right) and
      `src/features/auth/components/BraceField.tsx` (decorative `{ }` background
      glyphs). `GuestContinueLink` now renders in `AuthLayout`'s top bar (matching
      the mockup) rather than inside the form itself. The tabs are real
      `react-router-dom` `Link`s to `/login`/`/register` styled to look identical to
      the mockup's tabs — this keeps the two-route architecture decision from
      research.md while matching the visual design 1:1. `RegisterPage`'s placeholder
      in `App.tsx` also wraps in `AuthLayout` so the tabs look consistent before
      User Story 2 builds the real page._
- [x] T012 [P] [US1] Add a password reveal/hide toggle to the password blank in
      `LoginPage.tsx` (FR-005)
- [x] T013 [P] [US1] Show the signed-in identifier and a sign-out control in the
      primary navigation when `AuthContext` has a session, in
      `src/app/layout/RootLayout.tsx`. Depends on T006.
- [x] T014 [US1] Write `src/features/auth/pages/LoginPage.test.tsx`: valid login
      shows signed-in state; invalid credentials show the Vietnamese message without
      clearing input; empty password blank blocks submission, flags it, and moves
      focus, with no call attempted. Depends on T011.

**Checkpoint**: User Story 1 is fully functional and independently testable/
demoable — the MVP.

---

## Phase 4: User Story 2 - New visitor creates an account (Priority: P2)

**Goal**: A visitor can register through the Register view, land on `/login` with a
confirmation, and see a clear message if the email is already registered — all
against the mock.

**Independent Test**: Open `/register`, fill all three blanks with a new email,
submit → redirected to `/login` with an "account created" confirmation; repeat with
an email the mock already knows → inline "Email này đã được đăng ký, hãy đăng nhập".

- [x] T015 [US2] Implement `register(displayName, email, password)` in
      `src/features/auth/api/authClient.mock.ts`: new email →
      `{ status: 'success', session: null, accountCreated: true }` and records the
      mock account; already-used email →
      `{ status: 'error', errorCode: 'EMAIL_ALREADY_EXISTS', message: 'Email
  này đã được đăng ký, hãy đăng nhập' }`, per contracts/auth-client.md. Depends
      on T003.
      _Implementation note: added a shared in-memory `mockAccounts` Map (seeded with
      the T010 demo account) and revised `login()` to check it, so an account
      created via `register()` can immediately `login()` afterward — not explicitly
      required by any FR, but needed for the mock to behave coherently end-to-end.
      **Amended 2026-07-24**: error code renamed from `EMAIL_ALREADY_REGISTERED` to
      `EMAIL_ALREADY_EXISTS` to match the real backend contract
      (`docs/api/openapi.yaml`), received after this task was originally completed._
- [x] T016 [US2] Build `RegisterPage` using `InlineBlankForm` and
      `GuestContinueLink` (display name + email + password blanks), with pre-submit
      validation for empty blanks (FR-006), malformed email (FR-007), and password
      shorter than 8 characters (FR-008); on success navigates to `/login` with a
      confirmation banner, ignoring the `null` session (FR-013); on duplicate email
      shows the inline message with a link to `/login`, in
      `src/features/auth/pages/RegisterPage.tsx`. Depends on T008, T009, T015.
      _Implementation note: confirmation is passed via router `state`
      (`navigate('/login', { state: { justRegistered: true } })`); `LoginPage` reads
      it to show the "Đã tạo tài khoản thành công!" banner. `GuestContinueLink` is
      rendered by the shared `AuthLayout`, not duplicated in this page._
- [x] T017 [P] [US2] Add a password reveal/hide toggle to the password blank in
      `RegisterPage.tsx` (FR-005)
- [x] T018 [US2] Write `src/features/auth/pages/RegisterPage.test.tsx`: successful
      registration redirects to `/login` with confirmation copy; duplicate email
      shows the Vietnamese message; empty blank, malformed email, and
      under-8-character password are each blocked before any call is attempted.
      Depends on T016.

**Checkpoint**: User Stories 1 and 2 both work independently — the core
email/password auth loop is complete.

---

## Phase 5: User Story 4 - Sign in or register instantly via Google (Priority: P2)

**Goal**: A visitor can sign in via a mocked Google flow from either view — treated
as account creation if new, linked to an existing account if the email matches, and
cancel-safe with no spurious error.

**Independent Test**: Choose "Đăng nhập bằng Google" on `/login` or `/register` with
no existing matching account → signed in, treated as account creation; repeat with an
email matching an existing mock account → signed into that same account; trigger the
mock's cancel path → back to signed-out, no error shown.

- [x] T019 [US4] Implement `signInWithGoogle()` in
      `src/features/auth/api/authClient.mock.ts`: no matching account →
      `{ status: 'success', accountCreated: true, ... }`; email matches an existing
      mock account → `{ status: 'success', accountCreated: false, ... }` with that
      account's `id` (FR-020); cancel path →
      `{ status: 'error', errorCode: 'VALIDATION_ERROR', message: '' }`, per
      contracts/auth-client.md. Depends on T003, T015 (reuses the mock account
      store `register` populates, to detect a matching email).
      _Implementation note: `AuthClient.signInWithGoogle` gained an optional
      `{ simulate?: 'cancel' }` parameter (amended in `authClient.types.ts`), kept for
      tests/automation. **Amended 2026-07-24** (real Client ID supplied mid-build,
      see research.md): the identity is no longer a fixed mock — it comes from a
      real Google Identity Services (One Tap) prompt via the new
      `src/features/auth/api/googleIdentity.ts` (`VITE_GOOGLE_CLIENT_ID` env var,
      public value only; the client *secret* was correctly never used anywhere in
      this frontend). The credential's signature is NOT verified (no backend yet).
      Account create-vs-link behavior (FR-020) is unchanged — it now keys off the
      real email instead of a fixed one. `MockAccountRecord.password` remains
      optional so a Google-only account has no password and can never be logged
      into via the password flow._
- [x] T020 [P] [US4] Build `GoogleSignInButton` (triggers the mocked flow via
      `AuthContext`/`authClient.signInWithGoogle`, including a way to trigger the
      mock's cancel path for manual/testing purposes, and treats an empty-message
      error outcome as "no error to show") in
      `src/features/auth/components/GoogleSignInButton.tsx`. Depends on T019.
      _Implementation note: amended to call the real prompt; the separate UI
      "cancel (demo)" control was removed since dismissing the real Google prompt
      now produces the same empty-message outcome naturally. Tests mock
      `googleIdentity.ts`'s `requestGoogleCredential` rather than hitting Google._
- [x] T021 [US4] Wire `GoogleSignInButton` into both `LoginPage.tsx` and
      `RegisterPage.tsx` (FR-017). Depends on T011, T016, T020.
      _Implementation note: rendered below each form behind an "hoặc" divider._
- [x] T022 [US4] Write
      `src/features/auth/components/GoogleSignInButton.test.tsx`: new-account
      sign-in reaches a signed-in state; matching-email sign-in reaches the same
      existing account (not a duplicate); cancelling shows no error banner. Depends
      on T020.
      _Implementation note: `requestGoogleCredential` is mocked via `vi.mock` so
      tests never touch the real Google script/network._

**Checkpoint**: User Stories 1, 2, and 4 all work independently — every sign-in path
(email/password login, registration, Google) is complete.

---

## Phase 6: User Story 3 - Session and error states are demo-ready without a backend (Priority: P3)

**Goal**: The mocked session convincingly expires like a real 7-day JWT, both auth
views remain legible in light and dark presentation, and a double-submit cannot fire
two calls — proving the whole feature is reviewable and swappable without a backend.

**Independent Test**: Sign in, reload the page → still signed in; manipulate the
mock session's `expiresAt` into the past and reload → treated as signed out; toggle
light/dark presentation on both views → everything stays legible; double-click
submit → only one call fires.

- [x] T023 [US3] Implement expiry checking in `restoreSession()` in
      `src/features/auth/api/authClient.mock.ts`: return the stored session only if
      `expiresAt > Date.now()`, otherwise clear it and return `null`, per
      data-model.md Session lifecycle. Depends on T006.
      _Implementation note: `SESSION_STORAGE_KEY` is now exported from
      `authClient.mock.ts` — for tests only (T026), not for production code, which
      must still go through `AuthContext`/`authClient` per contracts/auth-client.md._
- [x] T024 [P] [US3] Review and adjust `LoginPage.tsx`, `RegisterPage.tsx`, and
      `InlineBlankForm.tsx` styling against the approved design tokens (cool paper
      neutrals, indigo accent, monospace reserved for placeholder motifs) to confirm
      legibility under both `prefers-color-scheme: light` and `dark` (FR-016, SC-005)
      _Implementation note: found and fixed one gap — `src/app/layout/RootLayout.tsx`
      used generic Tailwind `bg-white text-gray-900` for light mode instead of the
      approved `#F3F5F0`/`#1B1D1B` tokens (only its dark variant had been tokenized).
      `LoginPage`/`RegisterPage`/`InlineBlankForm`/`AuthLayout` were already fully
      tokenized with a `dark:` pair for every color._
- [x] T025 [US3] Add an in-flight guard to `LoginPage.tsx` and `RegisterPage.tsx`
      so a second submit is ignored while a call is pending (Edge Case:
      double-submit). Depends on T011, T016.
      _Implementation note: the existing `submitting`/`pending` React state guard
      (already present since T011/T016/T020) had a narrow race — state updates
      aren't synchronous, so two calls arriving in the same tick could both read the
      pre-update value. Hardened with a `useRef` guard, checked/set synchronously,
      in `LoginPage.tsx`, `RegisterPage.tsx`, and `GoogleSignInButton.tsx`._
- [x] T026 [US3] Write `src/features/auth/context/AuthContext.test.tsx`: a valid
      stored session is restored on mount; an expired stored session is cleared and
      treated as signed-out. Depends on T023.

**Checkpoint**: All four user stories are independently functional. The feature is
fully demo-ready without any backend, per SC-004 (swap-in-later guarantee).

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that spans all stories.

- [x] T027 Run `quickstart.md`'s 10 validation scenarios manually in a running
      browser (`npm run dev`), in both light and dark presentation
      _Implementation note: no headless-browser driver (chromium-cli/Playwright) is
      available in this environment. Scenarios 1-5 and 8-9's account-linking/create
      logic and scenario 10's dismiss-outcome logic are proven by the automated
      Vitest suite instead (see T028's run — each maps 1:1 to a named test).
      Scenario 6 (literal F5 reload) is proxied by `AuthContext.test.tsx`'s
      mount-time session restore, not a real browser reload. Scenario 7 (visual
      light/dark legibility) and the real Google prompt's actual on-screen rendering
      in scenarios 8-10 were reviewed in code (T024) and confirmed served correctly
      by the dev server (`/`, `/login`, `/register` all return 200), but were **not**
      visually confirmed pixel-by-pixel in a live browser — this is an open item for
      the user or a follow-up session with real browser tooling._
- [x] T028 Run `npm run lint`, `npm run build`, and `npm run test`; fix any failures
      (Constitution Principle V — all three must pass before this feature is done)
      _Result: lint 0 errors/warnings; build succeeds; 12/12 tests pass._
- [x] T029 Confirm no second implementation of the hidden-span auto-resize
      technique exists anywhere in `src/` outside `useAutoResizeBlank`
      (Constitution Principle I)
      _Result: confirmed via grep for `getBoundingClientRect`, `getComputedStyle`,
      the `-9999px` off-screen technique, and `createElement('span')` — all four
      only appear in `src/shared/hooks/useAutoResizeBlank.ts`._

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks all user stories.**
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational only. Does not depend on
  User Story 1 (separate page, separate `authClient` method), though both use
  `InlineBlankForm`/`GuestContinueLink` from Foundational.
- **User Story 4 (Phase 5)**: Depends on Foundational, and on T015 (US2's
  `register`) for the mock's account-matching store — but is independently
  _testable_ per its own acceptance scenarios once that store exists.
- **User Story 3 (Phase 6)**: Depends on Foundational (T006) and touches files
  already created by US1/US2 (T011/T016) for the double-submit guard — sequence
  after US1/US2 to avoid conflicting edits, even though its acceptance scenarios
  are independent of US1/US2's own behavior.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Parallel Opportunities

- T002 and T005 (Phase 2) can run in parallel — different files, no shared
  dependency.
- T012 and T013 (US1) can run in parallel once T011/T006 exist — different files.
- T017 (US2) can run in parallel with T015 — different files.
- T020 (US4) can start as soon as T019 exists, in parallel with nothing else in
  that phase (T021 depends on it).
- T024 (US3) can run in parallel with T023/T025 — pure styling review, no shared
  file being edited at the same time as the logic changes.
- Different user story **phases** cannot start in parallel by different people
  until Foundational (Phase 2) is fully done; after that, US1, US2, and US4 could be
  staffed in parallel (US4 only needs US2's T015 landed first for account-matching).

---

## Parallel Example: Phase 2 (Foundational)

```bash
Task: "Define Account/Session/AuthOutcome/AuthErrorCode types in src/features/auth/api/types.ts"
Task: "Implement useAutoResizeBlank hook in src/shared/hooks/useAutoResizeBlank.ts"
```

## Parallel Example: User Story 1

```bash
Task: "Add password reveal/hide toggle in src/features/auth/pages/LoginPage.tsx"
Task: "Show signed-in identifier + sign-out control in src/app/layout/RootLayout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 — Login).
3. **STOP and VALIDATE**: run quickstart.md scenarios 1–3, 6–7 against `/login` only.
4. Demo the MVP: sign in against the mock, see the signed-in nav state, see the
   invalid-credentials message.

### Incremental Delivery

1. Setup + Foundational → shared seams ready.
2. Add User Story 1 → validate → demo (MVP).
3. Add User Story 2 → validate registration + redirect → demo.
4. Add User Story 4 → validate Google paths → demo.
5. Add User Story 3 → validate session expiry, light/dark, no-double-submit → demo.
6. Polish (Phase 7) → full quickstart.md pass + lint/build/test green.

### Parallel Team Strategy

With multiple developers, after Foundational is done:

- Developer A: User Story 1 (Login)
- Developer B: User Story 2 (Register) — must land T015 before Developer C starts
  US4's account-matching work
- Developer C: User Story 4 (Google), starting once T015 is available
- User Story 3 is best done by whoever finishes first, since it touches files from
  both US1 and US2

---

## Phase 8: Real Backend Integration (added 2026-07-24, after Backend supplied `docs/api/openapi.yaml`)

**Purpose**: Get ahead of a real backend — implement `AuthClient` against the real
contract now, so connecting one later is just setting `VITE_API_BASE_URL`, with zero
UI-facing changes (SC-004 extended to the real client, not just the mock-swap case).

- [x] T030 Add `httpClient.ts`: `fetch` wrapper with `credentials: 'include'` (for the
      httpOnly `refresh_token` cookie), parses `{ error: {...} }` into a throwable
      `ApiError`, and `isApiConfigured()` gate. Add `VITE_API_BASE_URL` to
      `vite-env.d.ts` and `.env.example`.
- [x] T031 Extend `AuthClient` (`authClient.types.ts`): `restoreSession()` → `Promise<
  Session | null>` (async, both implementations); add
      `completeGoogleOAuth(code, state): Promise<AuthOutcome>`. Update
      `authClient.mock.ts` to match (trivial async wrap; `completeGoogleOAuth` stub
      returns an error — unreachable in mock mode).
- [x] T032 Add `authClient.real.ts`: `login`/`register` against `/auth/login`,
      `/auth/register`; `signInWithGoogle` fetches `/auth/oauth/google` and redirects
      the page (never resolves — tab navigates away); `completeGoogleOAuth` posts to
      `/auth/oauth/google/callback`; `restoreSession` calls `/auth/refresh` then
      `/users/me`; `logout` calls `/auth/logout`. Errors mapped via `httpClient.ts`'s
      `ApiError` onto this feature's flat `AuthOutcome` shape.
- [x] T033 Wire the switch in `authClient.ts`: `isApiConfigured() ? createRealAuthClient() : createMockAuthClient()`.
- [x] T034 Add `GoogleCallbackPage.tsx` + route `/auth/google/callback` in `App.tsx` —
      reads `code`/`state` from the URL, calls `completeGoogleOAuth`, signs in on
      success.
- [x] T035 Update `AuthProvider.tsx`: handle async `restoreSession()`, add
      `isRestoring` to context, and schedule a silent `restoreSession()` call ~60s
      before `session.expiresAt` so a real 15-minute `access_token` self-renews.
- [x] T036 Update the 3 tests that called `authClient.restoreSession()` synchronously
      (`AuthContext.test.tsx`, `GoogleSignInButton.test.tsx`, `LoginPage.test.tsx`) to
      `await` it.

**Result**: `npm run lint` 0 errors, `npm run build` succeeds, `npm run test` 12/12
pass, dev server serves the new files/route without error.

**Deliberately not done** (needs a live backend to verify, or is new scope beyond
this feature's spec.md, not a flow correction): end-to-end testing of the redirect
round trip against a real Google+backend pair; the email-verification gate the
contract implies after `/auth/register`; forgot/reset-password.

---

## Notes

- [P] tasks touch different files with no unmet dependency.
- [Story] labels trace every task back to spec.md's user stories for review.
- Each `authClient.mock.ts` task (T003, T010, T015, T019, T023) edits the same file
  across phases by design — it is the single integration point (FR-009); this is
  intentional shared-file sequencing, not an independence violation, since each
  story's _acceptance scenarios_ remain testable without the others.
- Commit after each task or logical group, per this repo's normal git conventions.
- Stop at any checkpoint to validate a story independently before continuing.
