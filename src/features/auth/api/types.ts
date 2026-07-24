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
}

// The three literals are the codes this feature's screens actually branch on
// (INVALID_CREDENTIALS, EMAIL_ALREADY_EXISTS match the real backend contract
// exactly — docs/api/openapi.yaml; VALIDATION_ERROR is defensive/internal only).
// Widened to accept any string so the real client (authClient.real.ts) can pass
// through backend codes this feature doesn't special-case yet (e.g. TOKEN_EXPIRED,
// GUEST_QUOTA_EXCEEDED) without a type error — `message` is always safe to display
// regardless of whether `errorCode` is one of the known literals.
export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'EMAIL_ALREADY_EXISTS' | 'VALIDATION_ERROR' | (string & {})

export type AuthOutcome =
  | { status: 'success'; session: Session | null; accountCreated: boolean }
  | { status: 'error'; errorCode: AuthErrorCode; message: string }
