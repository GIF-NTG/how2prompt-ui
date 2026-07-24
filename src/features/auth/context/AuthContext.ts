import { createContext } from 'react'
import type { Session } from '../api/types'

export interface AuthContextValue {
  session: Session | null
  signIn: (session: Session) => void
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
