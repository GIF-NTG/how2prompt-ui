# Phase 0 Research: Forgot & Reset Password

No `NEEDS CLARIFICATION` markers remained in Technical Context — the stack, testing
approach, and scope were all derivable from the existing `src/features/auth` code
and `CLAUDE.md`. This file records the non-obvious technical decisions the plan
depends on.

## Decision 1: Expose HTTP status on `ApiError`

**Decision**: Add a `status: number` field to `httpClient.ts`'s `ApiError` class,
populated from the `fetch` `Response.status`, alongside the existing `code`/`message`/
`details` fields parsed from the error envelope body.

**Rationale**: `docs/api/openapi.yaml` documents `POST /auth/reset-password` and
`GET /auth/verify-email` (used by the sibling `002-us1.6-verify-email` feature) as
returning `410 Gone` for an expired/already-used token, but gives no example
`error.code` string for that case (unlike, say, `EMAIL_ALREADY_EXISTS` or
`TOKEN_EXPIRED`, which the contract does show). Per Constitution Principle III,
`docs/api/openapi.yaml` is the literal wire-contract source of truth — since it only
documents the *status code* for this case, not a specific `error.code`, the frontend
should branch on the HTTP status (`410`) rather than guess an unconfirmed
`error.code` string. Guessing wrong would silently misclassify a real "link expired"
response as a generic error, breaking spec FR-004's "clear message and a path back to
requesting a new one" requirement.

**Alternatives considered**:
- *Assume a specific `error.code` (e.g. `RESET_TOKEN_EXPIRED`) without confirming
  it against the contract* — rejected: not documented, risks a false negative the
  first time this runs against the real backend.
- *Leave `ApiError` unchanged and treat all reset-password failures identically* —
  rejected: fails spec Acceptance Scenario 4 (expired/used link needs a distinct,
  actionable message, not a generic error).

**Impact**: `httpClient.ts`'s `ApiError` gains one field; `apiFetch`'s catch branch
adds `response.status` to the thrown error. This is additive — no existing caller
(`login`, `register`, `signInWithGoogle`, `completeGoogleOAuth`, `restoreSession`)
reads or depends on the new field, so none of them change behavior.

## Decision 2: No password-confirmation field on the reset form

**Decision**: The reset-password form has a single "new password" field (with a
show/hide toggle, matching the existing pattern), not a second "confirm password"
field.

**Rationale**: `RegisterPage.tsx` already sets this precedent — one password field
with a visibility toggle, no confirmation field — for the same class of "user types a
password once" interaction. Introducing a second field here would be a new pattern
for a feature explicitly scoped to reuse existing auth-screen conventions (spec
Assumptions), and the show/hide toggle already gives the user a way to check what
they typed.

**Alternatives considered**:
- *Add a confirm-password field* — rejected: inconsistent with Register's existing
  pattern for no stated reason in the spec; would need its own justification the spec
  doesn't provide.

## Decision 3: Reuse `AuthLayout` + `InlineBlank` for both new pages

**Decision**: `ForgotPasswordPage` and `ResetPasswordPage` are built with the same
`AuthLayout` wrapper and `InlineBlank` pill inputs already used by `LoginPage` and
`RegisterPage`.

**Rationale**: Constitution Principle I confines the pill/`InlineBlankForm` pattern
to "the auth screens that already use it" and forbids extending it to
template-generation/catalog screens — it does not forbid new auth screens from using
it, and CLAUDE.md's "Visual design direction" section directs reusing established
visual tokens rather than introducing new UI patterns per screen. Both new pages are
auth screens in the same Epic 1 identity surface as Login/Register.

**Alternatives considered**:
- *Build a plain (non-pill) form for these two screens* — rejected: would introduce a
  second, inconsistent visual pattern within the same feature slice for no
  spec-driven reason.

## Decision 4: Route paths

**Decision**: `forgot-password` (renders `ForgotPasswordPage`) and `reset-password`
(renders `ResetPasswordPage`, reading `?token=` from the URL query string), both
nested under the existing `RootLayout` route alongside `login`/`register`.

**Rationale**: Matches the existing flat, lowercase-kebab route-naming convention in
`App.tsx` (`login`, `register`, `auth/google/callback`). The reset link's token
travels as a query parameter, consistent with how `GoogleCallbackPage` already reads
`code`/`state` from the query string for a similar "backend redirects here with a
token" flow.

**Alternatives considered**:
- *Nest both under `/auth/...`* (matching `auth/google/callback`) — rejected: `login`
  and `register` are already top-level, not nested under `/auth`; nesting only the
  new two would be inconsistent with its closer siblings.
