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

export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'EMAIL_ALREADY_REGISTERED' | 'VALIDATION_ERROR'

export type AuthOutcome =
  | { status: 'success'; session: Session | null; accountCreated: boolean }
  | { status: 'error'; errorCode: AuthErrorCode; message: string }
