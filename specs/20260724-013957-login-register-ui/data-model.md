# Phase 1 Data Model: Login & Register UI (API-ready)

These are the client-side shapes the auth feature reads and writes today (all mocked,
no backend). They are named and shaped so that a real backend response can be mapped
onto the same fields later — see [contracts/auth-client.md](./contracts/auth-client.md)
for the functions that produce/consume them, and `research.md` for why the
`errorCode` vocabulary matches `agent/BA.md` §4.2.

## Account

Represents a registered identity (spec Key Entities: **Account**).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Opaque identifier; mock generates a random id, a real backend would return its own UUID. |
| `displayName` | `string` | Collected on Register (FR-003). Required, non-empty. |
| `email` | `string` | Collected on Register and used on Login. Required; must match a basic `local@domain` shape (FR-007). Also the join key used for Google account linking (FR-020). |
| `authProviders` | `('password' \| 'google')[]` | Which sign-in method(s) reach this account. A Google sign-in whose email matches an existing `password`-provider account adds `'google'` to that same account's list rather than creating a new `Account` (FR-020). |

**Validation rules** (client-side, before the mock/real call — FR-006, FR-007, FR-008):
- `displayName`: required, non-empty after trimming.
- `email`: required, must contain `@` and a domain segment.
- `password` (not stored on `Account` — see Auth outcome below): required, minimum 8
  characters (FR-008); never persisted or logged in plaintext (Constitution Principle
  IV, scoped).

**Note**: `password` is deliberately not a field on the stored `Account` shape —
it is submitted, validated, and handed to `AuthClient.register`/`login`, but never
retained client-side once the call resolves.

## Session

Represents the client-held signed-in state (spec Key Entities: **Session**).

| Field | Type | Notes |
|---|---|---|
| `accountId` | `string` | The `Account.id` this session belongs to. |
| `displayName` | `string` | Denormalized for immediate nav display (FR-011) without a lookup. |
| `email` | `string` | Denormalized, same reason. |
| `token` | `string` | Opaque mock token today; a real JWT once a backend exists. Never parsed client-side beyond expiry bookkeeping. |
| `issuedAt` | `number` (epoch ms) | Set when the session is created. |
| `expiresAt` | `number` (epoch ms) | `issuedAt + 7 days`, mirroring the project's real JWT lifetime (SRS AR-6). |

**Lifecycle**:
1. Created by a successful `login`, `register`-then-login, or `signInWithGoogle` call.
2. Persisted to a single `localStorage` key (owned by `AuthContext`, not read/written
   anywhere else — FR-012).
3. Restored on app load if `expiresAt > Date.now()`; otherwise treated as absent and
   the stored record is cleared (spec Edge Cases: expired mock session on reload).
4. Cleared immediately on sign-out (FR-011).

## Auth outcome

The structured result of a login, registration, or Google sign-in attempt (spec Key
Entities: **Auth outcome**). A discriminated union so calling code narrows on
`status` rather than checking multiple optional fields.

```text
AuthOutcome =
  | { status: 'success'; session: Session | null; accountCreated: boolean }
  | { status: 'error'; errorCode: AuthErrorCode; message: string }

AuthErrorCode =
  | 'INVALID_CREDENTIALS'      // Login: email/password did not match (FR-013 scenario 2)
  | 'EMAIL_ALREADY_REGISTERED' // Register: email already has a password-based account (FR-013 scenario 2 / US2)
  | 'VALIDATION_ERROR'         // Defensive only — client-side validation (FR-006/007/008) should
                                // normally prevent this from ever reaching AuthClient
```

- `accountCreated` on a `success` outcome distinguishes "this call created a new
  Account" (Register, or a Google sign-in with no matching email — FR-019) from
  "this call signed into an existing Account" (Login, or a Google sign-in linked by
  email — FR-020), so the UI can choose the right confirmation copy without a second
  lookup.
- `session` is `null` specifically for a `register()` success — per FR-013, creating
  an account MUST NOT sign the visitor in automatically, so there is no session to
  persist yet. `login()` and `signInWithGoogle()` always return a real `Session` on
  success.
- `message` is the Vietnamese, human-readable string the UI displays as-is (FR-014);
  `errorCode` is what the UI (and, later, a real backend integration) branches on.

## State ownership summary

| State | Owner | Persisted where |
|---|---|---|
| Current `Session` (or none) | `AuthContext` (React context provider wrapping the app) | `localStorage`, one key |
| In-flight submit / loading flag per form | Local component state in `LoginPage` / `RegisterPage` | Not persisted (Edge Case: no double-submit while in flight) |
| Typed blank values before submit | Local component state in each page | Not persisted — spec explicitly says switching views discards partially-typed values |
