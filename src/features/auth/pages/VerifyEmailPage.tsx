import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/useAuth'

type VerifyState = 'verifying' | 'success' | 'expired' | 'error'

export function VerifyEmailPage() {
  const { verifyEmail } = useAuth()
  // Re-read on every render (and thus every mount/navigation) — the token is
  // re-validated from the URL each time this page loads, including a back-button
  // return to an already-used link (spec Edge Case).
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [state, setState] = useState<VerifyState>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    setState('verifying')
    verifyEmail(token).then((outcome) => {
      if (cancelled) return
      if (outcome.status === 'success') {
        setState('success')
      } else if (outcome.errorCode === 'VERIFY_TOKEN_EXPIRED') {
        setState('expired')
      } else {
        // FR-006: any other backend failure still surfaces as a user-readable
        // message, same as every other AuthClient-backed action in this app.
        setErrorMessage(outcome.message)
        setState('error')
      }
    })
    return () => {
      cancelled = true
    }
  }, [token, verifyEmail])

  return (
    <AuthLayout>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#1B1D1B] dark:text-[#ECEEE8]">
          Xác minh email
        </h2>
      </div>

      {state === 'verifying' && (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Đang xác minh email của bạn...</p>
      )}

      {state === 'success' && (
        <p
          role="status"
          className="rounded-lg border border-[#2E7D4F]/30 bg-[#E4F3EA] px-4 py-2 text-sm text-[#2E7D4F] dark:border-[#6FCF9A]/30 dark:bg-[#1E3327] dark:text-[#6FCF9A]"
        >
          Email của bạn đã được xác minh thành công.
        </p>
      )}

      {state === 'expired' && (
        <div className="rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-3 text-sm leading-normal text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]">
          Liên kết đã hết hạn hoặc đã được sử dụng.{' '}
          <Link to="/" className="underline underline-offset-2">
            Quay lại trang chính
          </Link>{' '}
          để yêu cầu gửi lại email xác minh.
        </div>
      )}

      {state === 'error' && (
        <p
          role="alert"
          className="rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-2 text-sm leading-normal text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]"
        >
          {errorMessage}
        </p>
      )}
    </AuthLayout>
  )
}
