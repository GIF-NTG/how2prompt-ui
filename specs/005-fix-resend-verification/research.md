# Phase 0 Research: Fix Resend-Verification Contract & Add Login-Screen Resend Action

## Decision 1 — Real shape of `POST /auth/resend-verification`

**Decision**: The endpoint is public (no `Authorization` header required) and takes
`{ email }` in the JSON request body, exactly like `POST /auth/forgot-password`.

**Rationale**: Directly observed against the live backend deployment during prior
live-testing of `specs/004-auth-contract-migration` (recorded in project memory
`project-email-not-verified-login-gap`). `docs/api/openapi.yaml` currently has no
`security: []` override on this path, so it inherits the file's global
`security: [bearerAuth: []]` — the opposite of the real behavior — and declares no
`requestBody` at all. This is treated as ground truth over the currently written doc
per Constitution Principle III ("the real contract... supersedes any conflicting
shape").

**Alternatives considered**: Keep the doc as-is and add a second, new public endpoint
for the login-screen use case. Rejected — there is only one real backend endpoint;
inventing a second one the backend doesn't have would just create a different
contract mismatch.

## Decision 2 — `AuthClient.resendVerificationEmail` signature change

**Decision**: Change from `resendVerificationEmail(accessToken: string)` to
`resendVerificationEmail(email: string)`. The real backend call switches from
`Authorization: Bearer <accessToken>` with no body, to no `Authorization` header with
`body: { email }`.

**Rationale**: Matches Decision 1. `Session` already carries `.email` (used elsewhere,
e.g. `EmailVerificationBanner`'s session-gated rendering), so the existing caller
(`AuthProvider.resendVerificationEmail()`) can pass `session!.email` instead of
`session!.token` with no change to its own no-argument public signature or to
`EmailVerificationBanner`, which never touches the token/email distinction directly.

**Alternatives considered**: Overload the method to accept either an email or a
token. Rejected — the real backend only ever accepts an email; keeping a token
parameter around would document a capability that doesn't exist and invite the same
kind of contract drift this feature exists to fix.

## Decision 3 — Where the login-screen resend action lives

**Decision**: `LoginPage` calls `authClient.resendVerificationEmail(email)` directly
(the same module-level `authClient` singleton it already uses for `authClient.login(...)`),
rather than adding a new `AuthContext` method.

**Rationale**: `LoginPage` already bypasses `AuthContext` for the login call itself
(there is no session yet to attach the action to), so it's consistent to do the same
for resend, which likewise happens before any session exists. `AuthContext`'s existing
`resendVerificationEmail()` stays reserved for the session-gated banner, per its
existing doc comment and invariant ("only ever called from UI that itself only renders
when `session` is non-null").

**Alternatives considered**: Add an email-accepting variant to `AuthContext`
(`resendVerificationEmail(email?: string)`). Rejected — would blur the "only called
when a session exists" invariant already documented on the context method and the
banner that relies on it; a direct `authClient` call is a smaller, more consistent
change given `LoginPage`'s existing pattern.

## Decision 4 — Detecting `EMAIL_NOT_VERIFIED` on login

**Decision**: `LoginPage` branches UI on `outcome.errorCode === 'EMAIL_NOT_VERIFIED'`
after a failed `authClient.login(...)` call. No `AuthErrorCode` type change is needed
— it's already a widened union (`... | (string & {})`), so this string literal is
already assignable without a type edit.

**Rationale**: `docs/api/openapi.yaml`'s `/auth/login` responses don't currently list
`EMAIL_NOT_VERIFIED` as a documented code (per project memory, this was found live but
never added to the doc). Since this feature's UI now explicitly depends on that code
to decide whether to show the resend action, this plan also adds it to the documented
`401` response for `/auth/login` — leaving it undocumented while code branches on it
would recreate the exact kind of contract-doc/reality mismatch this feature is meant to
fix, just on a different endpoint.

**Alternatives considered**: Leave `/auth/login`'s doc unchanged and only fix the
resend-verification path, since the user's request named that endpoint specifically.
Rejected — the new frontend logic's correctness now depends on `EMAIL_NOT_VERIFIED`
being a stable, documented contract value, so documenting it is a small, directly
supporting change rather than scope creep.

## Decision 5 — Testability: simulating `EMAIL_NOT_VERIFIED` in the mock client

**Decision**: `authClient.mock.ts`'s `login()` is updated to return
`{ status: 'error', errorCode: 'EMAIL_NOT_VERIFIED', message }` when the submitted
credentials match a stored account whose `emailVerified` is `false` (today the mock
lets any registered account log in regardless of `emailVerified`).

**Rationale**: The mock backend is how this app is developed and browser-verified
without a live server (Constitution Principle V — "UI changes MUST be exercised in a
running browser"). Without this change, the new "resend from login" UI would be
unreachable and untestable against the mock, and `register()`'s existing mock
behavior (new accounts start with `emailVerified: false`) already sets up exactly the
account state needed to exercise it — a freshly registered mock account naturally hits
this branch on its first login attempt, matching the real dead-end scenario this
feature fixes.

**Alternatives considered**: Add a sentinel email/flag to force the branch only in
tests, leaving normal mock login behavior unchanged. Rejected — the real bug this
feature fixes is that this state (unverified account attempts login) already happens
naturally after registration; the mock should reflect that reality rather than require
a special-case trigger.

## Decision 6 — Resend cooldown/rate-limit source of truth from the login screen

**Decision**: The login-screen resend action reuses the exact same `RATE_LIMITED`
error-code branch and message already used by `EmailVerificationBanner` and defined in
`ResendVerificationOutcome` — no new outcome type or error code.

**Rationale**: It's the same backend endpoint and the same outcome type
(`AuthClient.resendVerificationEmail` returns one `ResendVerificationOutcome` regardless
of caller); introducing a second rate-limit representation would be an unjustified new
abstraction for a call that behaves identically regardless of which screen triggered it.

**Alternatives considered**: None seriously considered — this follows directly from
Decision 2's signature unification.
