import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../api/authClient'
import { useAuth } from '../context/useAuth'

/**
 * Real Google sign-in (One Tap) via the single `authClient` integration
 * point (FR-017/FR-018). The Google-issued credential is decoded
 * client-side only — its signature is NOT verified, since there is no
 * backend yet to do that (documented limitation, see googleIdentity.ts).
 * Dismissing the real Google prompt resolves as a no-op, no error shown
 * (FR-020's cancel scenario) — there is no separate "cancel" control here
 * because the real prompt already offers its own way to dismiss.
 */
export function GoogleSignInButton() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [pending, setPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pendingRef = useRef(false)

  async function handleClick() {
    // Ref-backed guard — see LoginPage.tsx for why this must be a ref, not
    // just the `pending` state (avoids a re-render-timing race).
    if (pendingRef.current) return
    setErrorMessage(null)
    pendingRef.current = true
    setPending(true)
    try {
      const outcome = await authClient.signInWithGoogle()
      if (outcome.status === 'success') {
        if (outcome.session) signIn(outcome.session)
        navigate('/')
        return
      }
      // A dismissed/cancelled prompt resolves with an empty message — nothing to show.
      if (outcome.message) {
        setErrorMessage(outcome.message)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể mở Google Sign-In.')
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg border border-[#DBDFD3] bg-white px-4 py-2 text-sm font-semibold text-[#1B1D1B] transition hover:bg-[#EAEDE6] disabled:opacity-60 dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8] dark:hover:bg-[#23282C]"
      >
        {pending ? 'Đang mở Google…' : 'Đăng nhập bằng Google'}
      </button>
      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-2 text-sm text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]"
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
