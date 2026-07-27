import { createContext } from 'react'
import type { ResendVerificationOutcome, Session, VerifyEmailOutcome } from '../api/types'

export interface AuthContextValue {
  session: Session | null
  /** True until the initial restoreSession() call settles — avoids flashing a
   * signed-out UI while a real backend's httpOnly-cookie refresh is in flight. */
  isRestoring: boolean
  signIn: (session: Session) => void
  signOut: () => Promise<void>
  /** Reads the current session's token internally — only ever called from UI that
   * itself only renders when `session` is non-null (see EmailVerificationBanner). */
  resendVerificationEmail: () => Promise<ResendVerificationOutcome>
  /** Refreshes the held session on success, if one exists in this tab. Works with
   * `session === null` too (verifying without an active session is a supported flow). */
  verifyEmail: (token: string) => Promise<VerifyEmailOutcome>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
