import type { AuthOutcome, Session } from './types'

/**
 * The single integration point for all authentication communication (FR-009).
 * Today `authClient.ts` re-exports a mock implementation; connecting a real
 * backend later means implementing this same interface and swapping that one
 * export — no other file should change (SC-004).
 */
export interface GoogleSignInOptions {
  /**
   * Demo/test-only hint to simulate the visitor cancelling the provider flow
   * (US4 scenario 3), since there is no real Google popup to cancel yet. A
   * real implementation can ignore this hint entirely.
   */
  simulate?: 'cancel'
}

export interface AuthClient {
  login(email: string, password: string): Promise<AuthOutcome>
  register(displayName: string, email: string, password: string): Promise<AuthOutcome>
  signInWithGoogle(options?: GoogleSignInOptions): Promise<AuthOutcome>
  logout(): Promise<void>
  restoreSession(): Session | null
}
