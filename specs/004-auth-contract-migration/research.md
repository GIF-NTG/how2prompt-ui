# Phase 0 Research: Auth API Contract Migration (v1.1.0)

No `NEEDS CLARIFICATION` markers remain in the Technical Context — the two decision
points that would otherwise have needed research were already resolved via
`/speckit-clarify` (see spec.md's Clarifications section). This document instead
records the concrete findings from reading the new `docs/api/openapi.yaml` /
`docs/api/API_CONTRACT.md` against the current implementation, since several of them
are not obvious from the feature description alone.

## Decision 1 — `AuthResponse` no longer embeds the user profile

**Decision**: Every call that used to receive `{ access_token, user: {...} }` in one
response (`login`, `signInWithGoogle`'s callback exchange, `restoreSession`'s refresh)
must now make a follow-up `GET /users/me` call to assemble a full `Session`, the same
pattern `restoreSession()` already uses today for the refresh case.

**Rationale**: `docs/api/openapi.yaml` lines 995–1005 define `AuthResponse` as only
`{ accessToken, expiresIn }`, explicitly noting "Không bao gồm tokenType hay user — chỉ
trả accessToken và thời hạn sống của nó." `login`, `POST /auth/oauth/google`, and
`POST /auth/refresh` all reference this same `AuthResponse` schema. `RegisterResponse`
is the one exception — it still embeds `user: UserProfile` inline — but that's moot
since register never receives tokens anyway (FR unchanged: registering never signs the
visitor in).

**Alternatives considered**: Decode profile fields out of the JWT `accessToken`
client-side — rejected, since the contract doesn't document the token's claims as a
public shape, and doing so would make the frontend depend on an undocumented internal
detail instead of the one endpoint (`/users/me`) the contract designates as the source
of truth for profile data (consistent with Constitution Principle III's
"backend-authoritative" framing).

## Decision 2 — `ApiResponse<T>` envelope is documented in prose, not in the per-path schema refs

**Decision**: Treat the `{ data, meta }` wrapper as real on the wire for every non-204
response, and unwrap `data` in `httpClient.ts`'s `apiFetch` before returning to callers
— even though the individual path definitions in `docs/api/openapi.yaml` (e.g. `/auth/login`'s
`$ref: '#/components/schemas/AuthResponse'`) reference the inner type directly rather
than `ApiResponse<AuthResponse>`.

**Rationale**: The wrapper is documented twice, independently, as a firm convention:
`openapi.yaml`'s `info.description` ("## Response Wrapper chuẩn... Tất cả endpoint trả
dữ liệu... đều được bọc trong `ApiResponse<T>`", with a Java record example) and
`API_CONTRACT.md`'s convention table ("Response wrapper | Mọi endpoint trả dữ liệu (trừ
`204`) bọc trong `ApiResponse<T>`"). No path in the spec ever shows a `$ref` nested
inside an explicit `ApiResponse<T>` schema — this is read as the spec authors
documenting the wrapper once at the top instead of repeating it on every path, not as
evidence the wrapper doesn't apply.

**Alternatives considered**: Trust only the literal per-path `$ref`s and skip
unwrapping — rejected, since it directly contradicts two independent, explicit
statements of the convention; if wrong, this assumption is cheap to falsify against a
live backend response during quickstart validation (see quickstart.md) and easy to
correct in one place (`apiFetch`).

## Decision 3 — Google sign-in moves to the GIS ID-token flow already partly built for the mock

**Decision**: `authClient.real.ts`'s `signInWithGoogle` stops calling
`GET /auth/oauth/google` + redirecting the tab, and instead obtains a Google ID token
client-side via the same Google Identity Services (GIS) integration
`googleIdentity.ts`/`authClient.mock.ts` already use, then calls
`POST /auth/oauth/google { idToken }` directly. `GoogleCallbackPage.tsx`,
`completeGoogleOAuth`, and the `authorization_url`/`state` sessionStorage bookkeeping
are removed. The `/auth/google/callback` route is deleted from `src/app/App.tsx` and
replaced with a redirect straight to `/login` (per spec Clarifications Q1), since the
app has no generic not-found route today and a bare deletion would otherwise leave a
stale bookmark on a blank page.

**Rationale**: `docs/api/openapi.yaml` lines 209–244 define `POST /auth/oauth/google`
taking `{ idToken }` and state plainly: "Không có endpoint callback riêng (không dùng
Authorization Code flow)." `googleIdentity.ts`'s `requestGoogleCredential()` already
loads the GIS script and obtains a credential this way for the mock client — it
currently decodes and returns only `{ email, name }` for the mock's own display
purposes (explicitly documented as unverified, client-side-only decoding, since there
was "no backend yet to do that"). The real client instead needs the **raw, undecoded**
ID token string forwarded byte-for-byte to the backend for it to verify — so
`googleIdentity.ts` needs a small extension (or a sibling export) that also returns the
raw credential string alongside (or instead of) the decoded claims.

**Alternatives considered**: Keep the authorization-code flow behind a flag for
rollback safety — rejected; the backend no longer exposes
`/auth/oauth/google/callback` at all under v1.1.0, so the old flow cannot function
regardless, and retaining its dead code violates spec FR-003/FR-007.

## Decision 4 — `AuthClient` method signatures are unchanged; only their real-implementation internals change

**Decision**: `verifyEmail(token)`, `resendVerificationEmail(accessToken)`, and
`resetPassword(token, newPassword)` keep their existing signatures and their existing
client-derived error codes (`VERIFY_TOKEN_EXPIRED`, `RESET_TOKEN_EXPIRED`,
`RATE_LIMITED`) exactly as already implemented. Only `authClient.real.ts`'s internals
change: `verifyEmail` switches from `GET /auth/verify-email?token=` to
`POST /auth/verify-email` with body `{ token }`; `resendVerificationEmail` treats HTTP
`202` as success (not just `200`); both `verifyEmail` and `resetPassword` continue to
branch on `error.status === 410` (not a body error code) for the "expired/used"
condition, since neither endpoint's schema in `docs/api/openapi.yaml` documents a body
`error.code` for that case — `TOKEN_CONSUMED` only appears as a human-readable row
label in `API_CONTRACT.md`'s error-code table, not as an actual `error.code` value
either endpoint's response schema declares.

**Rationale**: Keeps `VerifyEmailPage.tsx`, `EmailVerificationBanner.tsx`, and
`ResetPasswordPage.tsx` completely untouched — this migration's spec Assumptions
explicitly say "same outcome as before" means matching user-visible wording, not
identical internal error-code values, since those are what the migration is
deliberately allowed to change.

**Alternatives considered**: Rename both derived codes to a single shared
`TOKEN_CONSUMED` value end-to-end — rejected; it would touch `VerifyEmailPage.tsx`'s
and `ResetPasswordPage.tsx`'s branch conditions for zero user-visible benefit, and
`API_CONTRACT.md` doesn't actually contradict keeping two distinct client-side names
for the same underlying HTTP condition.

## Decision 5 — Mechanical field renames

**Decision**: Apply the following 1:1 renames inside `authClient.real.ts` and
`httpClient.ts`'s `ApiErrorBody`/request bodies (no behavior change, no new types):

| Old (snake_case) | New (camelCase) | Where |
|---|---|---|
| `access_token` | `accessToken` | `AuthResponseBody`, `apiFetch` request options |
| `expires_in` | `expiresIn` | `AuthResponseBody` |
| `full_name` | `fullName` | `BackendUser`, register request body |
| `email_verified` | `emailVerified` | `BackendUser` |
| `new_password` | `newPassword` | reset-password request body |
| `trace_id` | `traceId` | `ApiErrorBody.error` |
| `token_type` | *(removed)* | `AuthResponseBody` no longer has this field at all |
| `authorization_url`, `state` (Google) | *(removed)* | replaced by the single `idToken` flow (Decision 3) |

**Rationale**: Direct 1:1 mapping from `docs/api/openapi.yaml`'s updated schemas
(`AuthResponse`, `UserProfile`, `RegisterRequest`, `ErrorResponse`, `/auth/reset-password`'s
request body). No design judgment involved.

**Alternatives considered**: N/A — mechanical rename.

## Decision 6 — `authClient.mock.ts` needs no field renames, only continued parity with the `AuthClient` interface

**Decision**: The mock client's in-memory `MockAccountRecord`/`Session` construction is
untouched by this migration (it never spoke snake_case on the wire — it only ever
produced `Session` objects directly). No changes are needed beyond what's already
required to keep it satisfying the unchanged `AuthClient` interface (Decision 4).

**Rationale**: Spec Assumptions already scope the mock client as "updated alongside the
real client so both stay consistent" — verified here to mean "stays compilable against
the same interface," not "needs its own wire-format changes," since it has no wire
format to begin with.

**Alternatives considered**: N/A.

## Decision 7 — Constitution Principle III's stale `trace_id` example

**Decision**: `.specify/memory/constitution.md` Principle III is amended, as a PATCH
version bump (3.0.1 → 3.0.2), to change its literal quote from
`` `{ error: { code, message, details?, trace_id? } }` `` to
`` `{ error: { code, message, details?, traceId? } }` ``, with a Sync Impact Report
entry documenting the correction. This is tracked as an explicit task in `tasks.md`,
not left as an incidental side effect.

**Rationale**: Per spec Clarifications Q2 and the Governance section's amendment
process (stated rationale + version bump + propagation check), fixing this now avoids
the constitution silently drifting out of sync with the contract doc it exists to
summarize.

**Alternatives considered**: Defer to a separate `/speckit-constitution` pass —
rejected per the clarification answer; the fix is a one-line PATCH, cheap enough to
bundle with this migration.
