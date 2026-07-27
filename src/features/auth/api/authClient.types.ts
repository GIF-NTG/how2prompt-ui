import type {
  AuthOutcome,
  PasswordResetOutcome,
  PasswordResetRequestOutcome,
  ProfileOutcome,
  ResendVerificationOutcome,
  Session,
  UpdateProfileInput,
  VerifyEmailOutcome,
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
   * Starts and completes Google sign-in in a single call. Both mock and real
   * implementations open the real Google Identity Services (One Tap) prompt to
   * obtain an ID token; the mock decodes it client-side (no backend to verify
   * against), the real implementation forwards the raw token to
   * `POST /auth/oauth/google`, which the backend verifies server-side.
   */
  signInWithGoogle(options?: GoogleSignInOptions): Promise<AuthOutcome>
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
   * `errorCode: 'VERIFY_TOKEN_EXPIRED'` signals an expired or already-used token.
   * Works whether or not the visitor has an active session — authenticates via the
   * token itself, not `Authorization`.
   */
  verifyEmail(token: string): Promise<VerifyEmailOutcome>
  /**
   * Requires the caller's current `access_token` explicitly — unlike most
   * `AuthClient` methods, this endpoint requires `Authorization: Bearer` (it acts on
   * the calling user's own account), and the client itself holds no session state.
   * `errorCode: 'RATE_LIMITED'` signals the backend's resend cooldown is still active.
   */
  resendVerificationEmail(accessToken: string): Promise<ResendVerificationOutcome>
  /**
   * Async because the real implementation must round-trip to the backend
   * (`POST /auth/refresh`, using the httpOnly `refresh_token` cookie, then
   * `GET /users/me`) to turn a still-valid cookie into an in-memory `access_token`
   * — there is no synchronous way to know the session is valid. The mock wraps
   * its synchronous `localStorage` read in an already-resolved Promise.
   */
  restoreSession(): Promise<Session | null>
  /** Fetches the caller's own profile. Requires an active session's access token. */
  getProfile(accessToken: string): Promise<ProfileOutcome>
  /**
   * `errorCode: 'USERNAME_TAKEN'` signals a duplicate username (409). Requires
   * the caller's current access token.
   */
  updateProfile(accessToken: string, input: UpdateProfileInput): Promise<ProfileOutcome>
}
