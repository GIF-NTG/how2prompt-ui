export interface Account {
  id: string
  displayName: string
  email: string
  authProviders: ('password' | 'google')[]
}

export interface Session {
  accountId: string
  displayName: string
  email: string
  token: string
  issuedAt: number
  expiresAt: number
  emailVerified: boolean
}

// The three literals are the codes this feature's screens actually branch on
// (INVALID_CREDENTIALS, EMAIL_ALREADY_EXISTS match the real backend contract
// exactly — docs/api/openapi.yaml; VALIDATION_ERROR is defensive/internal only).
// Widened to accept any string so the real client (authClient.real.ts) can pass
// through backend codes this feature doesn't special-case yet (e.g. TOKEN_EXPIRED,
// GUEST_QUOTA_EXCEEDED) without a type error — `message` is always safe to display
// regardless of whether `errorCode` is one of the known literals.
export type AuthErrorCode =
  'INVALID_CREDENTIALS' | 'EMAIL_ALREADY_EXISTS' | 'VALIDATION_ERROR' | (string & {})

export type AuthOutcome =
  | { status: 'success'; session: Session | null; accountCreated: boolean }
  | { status: 'error'; errorCode: AuthErrorCode; message: string }

// Neither of these carries a session — requesting/completing a password reset never
// authenticates the visitor (mirrors register()'s session: null precedent).
export type PasswordResetRequestOutcome =
  { status: 'success' } | { status: 'error'; errorCode: AuthErrorCode; message: string }

// 'RESET_TOKEN_EXPIRED' is client-derived from ApiError.status === 410 (see
// httpClient.ts), not a backend error.code — docs/api/openapi.yaml documents only
// the status for this case, not a specific code.
export type PasswordResetOutcome =
  | { status: 'success' }
  | { status: 'error'; errorCode: AuthErrorCode | 'RESET_TOKEN_EXPIRED'; message: string }

// 'VERIFY_TOKEN_EXPIRED' is client-derived from ApiError.status === 410, same
// convention as 'RESET_TOKEN_EXPIRED' — docs/api/openapi.yaml documents only the
// status for /auth/verify-email's expired-token case, not a specific error.code.
export type VerifyEmailOutcome =
  | { status: 'success' }
  | { status: 'error'; errorCode: AuthErrorCode | 'VERIFY_TOKEN_EXPIRED'; message: string }

// 'RATE_LIMITED' is client-derived from ApiError.status === 429.
export type ResendVerificationOutcome =
  | { status: 'success' }
  | { status: 'error'; errorCode: AuthErrorCode | 'RATE_LIMITED'; message: string }

// The editable subset of the backend's UserProfile schema (docs/api/openapi.yaml)
// this feature reads/writes — the full schema also has id/email/avatarUrl/timezone/
// plan/isAdmin/personalWorkspaceId/createdAt, none of which US-1.7 displays or edits.
export interface UserProfile {
  fullName: string
  username: string | null
  bio: string | null
  locale: 'en' | 'vi'
}

// Same shape as UserProfile in this feature's scope — kept as a separate name for
// clarity at call sites (getProfile returns a UserProfile, updateProfile takes an
// UpdateProfileInput).
export type UpdateProfileInput = UserProfile

// 'USERNAME_TAKEN' is client-derived from ApiError.status === 409 — docs/api/openapi.yaml
// documents only the status for PATCH /users/me's duplicate-username case, not a
// specific error.code (same convention as RESET_TOKEN_EXPIRED/VERIFY_TOKEN_EXPIRED).
export type ProfileOutcome =
  | { status: 'success'; profile: UserProfile }
  | { status: 'error'; errorCode: AuthErrorCode | 'USERNAME_TAKEN'; message: string }
