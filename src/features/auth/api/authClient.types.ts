import type {
  AuthOutcome,
  PasswordResetOutcome,
  PasswordResetRequestOutcome,
  Session,
} from './types'

/**
 * The single integration point for all authentication communication (FR-009).
 * Today `authClient.ts` picks between the mock (`authClient.mock.ts`) and the real
 * implementation (`authClient.real.ts`) based on `VITE_API_BASE_URL` — no other file
 * should ever import either implementation directly (SC-004).
 */
export interface GoogleSignInOptions {
  /**
   * Demo/test-only hint to simulate the visitor cancelling the provider flow
   * (US4 scenario 3). The mock uses it directly; the real implementation ignores
   * it, since dismissing the real redirect flow is detected differently (the
   * visitor simply never returns to the callback route).
   */
  simulate?: 'cancel'
}

export interface AuthClient {
  login(email: string, password: string): Promise<AuthOutcome>
  register(displayName: string, email: string, password: string): Promise<AuthOutcome>
  /**
   * Starts Google sign-in. Mock: opens the real Google Identity Services (One Tap)
   * prompt and resolves once the visitor picks an account or dismisses it. Real:
   * fetches the provider's authorization URL and redirects the whole page there —
   * this call does not meaningfully "resolve" in that case, since the tab
   * navigates away; the flow completes on `completeGoogleOAuth` instead, from the
   * callback route Google redirects back to.
   */
  signInWithGoogle(options?: GoogleSignInOptions): Promise<AuthOutcome>
  /**
   * Finishes the real authorization-code Google flow: called by
   * `GoogleCallbackPage` with the `code`/`state` query params Google redirected
   * back with. The mock implementation has no redirect step to complete and
   * always resolves with an error if this is ever called.
   */
  completeGoogleOAuth(code: string, state: string): Promise<AuthOutcome>
  logout(): Promise<void>
  /**
   * Always resolves `{ status: 'success' }` for a well-formed email, regardless of
   * whether it matches an existing account — no account-enumeration signal (FR-002).
   */
  requestPasswordReset(email: string): Promise<PasswordResetRequestOutcome>
  /**
   * `errorCode: 'RESET_TOKEN_EXPIRED'` signals an expired or already-used token
   * (see PasswordResetOutcome) — never authenticates the visitor on success.
   */
  resetPassword(token: string, newPassword: string): Promise<PasswordResetOutcome>
  /**
   * Async because the real implementation must round-trip to the backend
   * (`POST /auth/refresh`, using the httpOnly `refresh_token` cookie, then
   * `GET /users/me`) to turn a still-valid cookie into an in-memory `access_token`
   * — there is no synchronous way to know the session is valid. The mock wraps
   * its synchronous `localStorage` read in an already-resolved Promise.
   */
  restoreSession(): Promise<Session | null>
}
