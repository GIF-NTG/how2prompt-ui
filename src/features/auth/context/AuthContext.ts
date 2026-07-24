import { createContext } from 'react'
import type { Session } from '../api/types'

export interface AuthContextValue {
  session: Session | null
  /** True until the initial restoreSession() call settles — avoids flashing a
   * signed-out UI while a real backend's httpOnly-cookie refresh is in flight. */
  isRestoring: boolean
  signIn: (session: Session) => void
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
