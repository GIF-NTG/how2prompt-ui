import { useEffect, useState, type ReactNode } from 'react'
import { authClient } from '../api/authClient'
import type { Session } from '../api/types'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    setSession(authClient.restoreSession())
  }, [])

  function signIn(nextSession: Session) {
    setSession(nextSession)
  }

  async function signOut() {
    await authClient.logout()
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, signIn, signOut }}>{children}</AuthContext.Provider>
}
