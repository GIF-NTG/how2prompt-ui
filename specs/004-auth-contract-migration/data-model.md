# Phase 1 Data Model: Auth API Contract Migration (v1.1.0)

Everything in `src/features/auth/api/types.ts` (`Session`, `AuthOutcome`,
`PasswordResetOutcome`, `VerifyEmailOutcome`, `ResendVerificationOutcome`, etc.) is
**unchanged** by this migration — see research.md Decision 4/6. This document instead
describes the wire-level shapes `authClient.real.ts` now reads/writes, and how they
assemble into the unchanged client-side `Session`.

## Wire entity: `ApiResponse<T>` envelope (new)

```json
{ "data": { /* T */ }, "meta": { /* PageMeta | null */ } }
```

- Wraps every non-`204` response body (research.md Decision 2).
- `httpClient.ts`'s `apiFetch<T>` unwraps `data` before returning to callers — callers
  never see the envelope itself.
- `meta` is not consumed anywhere yet (no paginated list is implemented in this repo —
  see spec Assumptions); `apiFetch` does not need to expose it until a feature that
  needs `PageMeta` is built.

## Wire entity: `ErrorResponse`

```json
{ "error": { "code": "string", "message": "string", "details": {}, "traceId": "uuid" } }
```

- Same shape as before, only `trace_id` → `traceId`. `httpClient.ts`'s
  `ApiErrorBody`/`ApiError` class rename that one field; `ApiError.code`/`.message`/`.status`/`.details`
  (the public surface every caller uses) are unchanged.

## Wire entity: `AuthResponse` (changed)

```json
{ "accessToken": "string", "expiresIn": 900 }
```

- Returned by `POST /auth/login`, `POST /auth/oauth/google`, `POST /auth/refresh`.
- No longer contains `user` or `tokenType` (research.md Decision 1). Any caller that
  needs profile fields (`displayName`, `email`, `emailVerified`) must separately call
  `GET /users/me` with the fresh `accessToken`.

## Wire entity: `UserProfile` (subset consumed here)

```json
{
  "id": "uuid",
  "email": "string",
  "fullName": "string",
  "emailVerified": true
}
```

(Full schema has more fields — `username`, `avatarUrl`, `bio`, `locale`, `timezone`,
`plan`, `isAdmin`, `personalWorkspaceId`, `createdAt` — none of which this feature's
`Session` shape consumes; only the four above map onto `Session`.)

## Wire entity: `RegisterResponse` (unchanged shape, still embeds `user`)

```json
{ "user": { /* UserProfile */ }, "message": "string" }
```

- `register()` never turns this into a `Session` (registering never signs the visitor
  in, per the existing FR-013-equivalent precedent) — the rename that matters here is
  just the request body's `full_name` → `fullName` and `new_password` is N/A to this
  endpoint.

## Assembly: `Session` (client-side type, unchanged) ← two wire calls

```ts
// src/features/auth/api/types.ts — UNCHANGED
export interface Session {
  accountId: string
  displayName: string
  email: string
  token: string
  issuedAt: number
  expiresAt: number
  emailVerified: boolean
}
```

Every path that produces a `Session` now does it in two steps instead of one:

1. `POST /auth/login` | `POST /auth/oauth/google` | `POST /auth/refresh` →
   `AuthResponse { accessToken, expiresIn }`.
2. `GET /users/me` (with `Authorization: Bearer <accessToken>` from step 1) →
   `UserProfile` → mapped onto `Session.{accountId, displayName, email, emailVerified}`,
   with `token`/`issuedAt`/`expiresAt` computed from step 1's `accessToken`/`expiresIn`
   exactly as `toSession()` does today.

`restoreSession()` already does exactly this two-step sequence for the refresh case —
this migration extends the same pattern to `login` and `signInWithGoogle`'s single
`POST /auth/oauth/google` call, replacing the old single-response
`toSession(AuthResponseBody)` mapping (which read `body.user.*` directly) with a
`toSession(authResponse, userProfile)`-shaped helper (or equivalent) that takes both
pieces.

## Wire entity: Google sign-in request (changed)

```json
{ "idToken": "string" }
```

- `POST /auth/oauth/google`, `security: []`. Replaces the old
  `GET /auth/oauth/google` (returns `authorization_url`+`state`) +
  `POST /auth/oauth/google/callback` (`code`+`state`) pair — both removed.
- The `idToken` is the raw, unverified-by-the-frontend Google ID token string obtained
  via `googleIdentity.ts`'s GIS integration; the backend verifies it server-side
  (Constitution Principle IV — no client-side trust decision is made on its claims).

## Wire entity: verify-email request (changed)

```json
{ "token": "string" }
```

- `POST /auth/verify-email` (was `GET /auth/verify-email?token=`). `security: []` —
  still authenticates via the token itself, not the visitor's session.

## Unchanged wire entities

- `LoginRequest { email, password }` — already camelCase-compatible (no snake_case
  fields to begin with).
- `/auth/reset-password` request: `{ token, newPassword }` (was `new_password`).
- `/auth/resend-verification`: no request body; response status changes `200` → `202`
  (still mapped to `{ status: 'success' }` client-side — research.md Decision 4).
- `/auth/forgot-password`: `{ email }`, unchanged.
- `/auth/logout`: no body, `204`, unchanged.
