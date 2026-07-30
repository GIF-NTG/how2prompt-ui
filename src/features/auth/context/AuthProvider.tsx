import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
  // Read by the stable (useCallback [], no deps) methods below so their
  // identity never changes across renders — see rule 5.11 in
  // vercel-react-best-practices: the context value and its methods must stay
  // referentially stable, or every AuthProvider re-render (sign-in, sign-out,
  // the silent refresh timer) cascades to all 11+ useAuth() consumers.
  const sessionRef = useRef(session)
  sessionRef.current = session

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

  const signIn = useCallback((nextSession: Session) => {
    setSession(nextSession)
  }, [])

  const signOut = useCallback(async () => {
    await authClient.logout()
    setSession(null)
  }, [])

  const resendVerificationEmail = useCallback(async () => {
    // Invariant: only ever called from UI that itself only renders when `session`
    // is non-null (EmailVerificationBanner) — not defended, matching signOut()'s
    // existing assumption pattern.
    return authClient.resendVerificationEmail(sessionRef.current!.email)
  }, [])

  const verifyEmail = useCallback(async (token: string) => {
    const outcome = await authClient.verifyEmail(token)
    if (outcome.status === 'success' && sessionRef.current) {
      const refreshed = await authClient.restoreSession()
      setSession(refreshed)
    }
    return outcome
  }, [])

  const getProfile = useCallback(async () => {
    // Invariant: only ever called from UI that itself only renders when `session`
    // is non-null (ProfileSettingsPage) — not defended, matching
    // resendVerificationEmail()'s existing assumption pattern.
    return authClient.getProfile(sessionRef.current!.token)
  }, [])

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const outcome = await authClient.updateProfile(sessionRef.current!.token, input)
    if (outcome.status === 'success') {
      setSession((current) =>
        current ? { ...current, displayName: outcome.profile.fullName } : current,
      )
    }
    return outcome
  }, [])

  const value = useMemo(
    () => ({
      session,
      isRestoring,
      signIn,
      signOut,
      resendVerificationEmail,
      verifyEmail,
      getProfile,
      updateProfile,
    }),
    [
      session,
      isRestoring,
      signIn,
      signOut,
      resendVerificationEmail,
      verifyEmail,
      getProfile,
      updateProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
