import { useEffect, useRef, useState, type ReactNode } from 'react'
import { authClient } from '../api/authClient'
import type { Session, UpdateProfileInput } from '../api/types'
import { AuthContext } from './AuthContext'

// Refresh this long before expiry so a request never races an about-to-expire
// access_token. Clamped against the token's own lifetime for the mock's
// long-lived session (see the Math.max below) — a 15-minute real access_token
// refreshes ~1 minute early; a 7-day mock session effectively never needs it.
const REFRESH_MARGIN_MS = 60_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    authClient.restoreSession().then((restored) => {
      if (!cancelled) {
        setSession(restored)
        setIsRestoring(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Silently refresh the session shortly before it expires, so a short-lived
  // real access_token (15 min) doesn't sign the visitor out mid-visit — as long
  // as the backend's httpOnly refresh_token cookie is still valid. Re-uses
  // restoreSession() itself, since for the real client that already IS the
  // refresh call; for the mock it's a harmless re-read of the same session.
  useEffect(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current)
      refreshTimer.current = null
    }
    if (!session) return

    const delay = Math.max(session.expiresAt - Date.now() - REFRESH_MARGIN_MS, 0)
    refreshTimer.current = setTimeout(() => {
      authClient.restoreSession().then((refreshed) => {
        setSession(refreshed)
      })
    }, delay)

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
    }
  }, [session])

  function signIn(nextSession: Session) {
    setSession(nextSession)
  }

  async function signOut() {
    await authClient.logout()
    setSession(null)
  }

  async function resendVerificationEmail() {
    // Invariant: only ever called from UI that itself only renders when `session`
    // is non-null (EmailVerificationBanner) — not defended, matching signOut()'s
    // existing assumption pattern.
    return authClient.resendVerificationEmail(session!.token)
  }

  async function verifyEmail(token: string) {
    const outcome = await authClient.verifyEmail(token)
    if (outcome.status === 'success' && session) {
      const refreshed = await authClient.restoreSession()
      setSession(refreshed)
    }
    return outcome
  }

  async function getProfile() {
    // Invariant: only ever called from UI that itself only renders when `session`
    // is non-null (ProfileSettingsPage) — not defended, matching
    // resendVerificationEmail()'s existing assumption pattern.
    return authClient.getProfile(session!.token)
  }

  async function updateProfile(input: UpdateProfileInput) {
    const outcome = await authClient.updateProfile(session!.token, input)
    if (outcome.status === 'success') {
      setSession((current) => (current ? { ...current, displayName: outcome.profile.fullName } : current))
    }
    return outcome
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isRestoring,
        signIn,
        signOut,
        resendVerificationEmail,
        verifyEmail,
        getProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
