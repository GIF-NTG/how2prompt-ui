import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'

const COUNTDOWN_SECONDS = 5 * 60

export function EmailVerificationBanner() {
  const { resendVerificationEmail } = useAuth()
  const [sending, setSending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const sendingRef = useRef(false)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  async function handleResend() {
    if (sendingRef.current || secondsLeft > 0) return
    sendingRef.current = true
    setSending(true)
    setStatusMessage(null)
    setErrorMessage(null)
    try {
      const outcome = await resendVerificationEmail()
      if (outcome.status === 'success') {
        setStatusMessage(
          'Your request to resend the verification email has been received — it will arrive in your inbox shortly.',
        )
        setSecondsLeft(COUNTDOWN_SECONDS)
      } else if (outcome.errorCode === 'RATE_LIMITED') {
        setErrorMessage('You just requested a resend — please wait a few minutes and try again.')
        setSecondsLeft(COUNTDOWN_SECONDS)
      } else {
        // FR-006: any other backend failure still surfaces as a user-readable
        // message, same as every other AuthClient-backed action in this app.
        setErrorMessage(outcome.message)
      }
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const countdownLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="border-b border-[#DBDFD3] bg-[#EAEDE6] px-4 py-2 text-sm text-[#1B1D1B] dark:border-[#2C3130] dark:bg-[#23282C] dark:text-[#ECEEE8]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>Please verify your email to unlock full access.</span>
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={sending || secondsLeft > 0}
          className="font-mono text-xs text-[#3652E0] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:no-underline disabled:opacity-60 dark:text-[#8493FF]"
        >
          {secondsLeft > 0 ? `Resend email (${countdownLabel})` : 'Resend email'}
        </button>
      </div>
      {statusMessage && (
        <p role="status" className="mt-2 text-[#2E7D4F] dark:text-[#6FCF9A]">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-2 text-[#C23A2E] dark:text-[#FF7A6B]">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
