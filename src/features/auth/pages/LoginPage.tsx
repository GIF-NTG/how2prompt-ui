import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthTextField } from '../components/AuthTextField'
import { AuthLayout } from '../components/AuthLayout'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { authClient } from '../api/authClient'
import { useAuth } from '../context/useAuth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LoginLocationState {
  justRegistered?: boolean
  passwordWasReset?: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, session, isRestoring } = useAuth()
  const locationState = location.state as LoginLocationState | null
  const justRegistered = Boolean(locationState?.justRegistered)
  const passwordWasReset = Boolean(locationState?.passwordWasReset)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [passwordInvalid, setPasswordInvalid] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resendSending, setResendSending] = useState(false)
  const [resendStatusMessage, setResendStatusMessage] = useState<string | null>(null)
  const [resendErrorMessage, setResendErrorMessage] = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const resendingRef = useRef(false)

  // Wait for the initial session restore before deciding anything (mirrors
  // ProfileSettingsPage's isRestoring gate) — otherwise a signed-in visitor who
  // navigates back to /login (or hits it via browser back) would see the form
  // instead of being sent home.
  if (isRestoring) return null
  if (session) return <Navigate to="/" replace />

  function resetResendState() {
    setEmailNotVerified(false)
    setResendStatusMessage(null)
    setResendErrorMessage(null)
  }

  async function handleResend() {
    if (resendingRef.current) return
    const trimmedEmail = email.trim()
    if (!EMAIL_PATTERN.test(trimmedEmail)) return
    resendingRef.current = true
    setResendSending(true)
    setResendStatusMessage(null)
    setResendErrorMessage(null)
    try {
      const outcome = await authClient.resendVerificationEmail(trimmedEmail)
      if (outcome.status === 'success') {
        setResendStatusMessage(
          'Your request to resend the verification email has been received — it will arrive in your inbox shortly.',
        )
      } else {
        setResendErrorMessage(outcome.message)
      }
    } finally {
      resendingRef.current = false
      setResendSending(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // A ref-backed guard (not just the `submitting` state) closes the race
    // where a second submit fires before React re-renders the disabled
    // button — state updates aren't synchronous, this ref read is.
    if (submittingRef.current) return
    setErrorMessage(null)
    resetResendState()

    const trimmedEmail = email.trim()
    const isEmailEmpty = trimmedEmail.length === 0
    const isEmailMalformed = !isEmailEmpty && !EMAIL_PATTERN.test(trimmedEmail)
    const isPasswordEmpty = password.length === 0

    setEmailInvalid(isEmailEmpty || isEmailMalformed)
    setPasswordInvalid(isPasswordEmpty)

    if (isEmailEmpty || isEmailMalformed) {
      emailRef.current?.focus()
      return
    }
    if (isPasswordEmpty) {
      passwordRef.current?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      const outcome = await authClient.login(trimmedEmail, password)
      if (outcome.status === 'success') {
        if (outcome.session) signIn(outcome.session)
        navigate('/')
      } else {
        setErrorMessage(outcome.message)
        if (outcome.errorCode === 'EMAIL_NOT_VERIFIED') setEmailNotVerified(true)
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-xl font-bold tracking-tight text-[#1B1D1B] dark:text-[#ECEEE8]">
        Welcome back
      </h2>

      {justRegistered && (
        <p
          role="status"
          className="rounded-lg border border-[#3652E0]/30 bg-[#E7EAFC] px-4 py-2 text-sm text-[#3652E0] dark:border-[#8493FF]/30 dark:bg-[#262B4A] dark:text-[#8493FF]"
        >
          Account created successfully! Please log in to continue.
        </p>
      )}

      {passwordWasReset && (
        <p
          role="status"
          className="rounded-lg border border-[#3652E0]/30 bg-[#E7EAFC] px-4 py-2 text-sm text-[#3652E0] dark:border-[#8493FF]/30 dark:bg-[#262B4A] dark:text-[#8493FF]"
        >
          Password reset successfully! Please log in with your new password.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <AuthTextField
          ref={emailRef}
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            resetResendState()
          }}
          invalid={emailInvalid}
          autoComplete="email"
        />

        <AuthTextField
          ref={passwordRef}
          name="password"
          label="Password"
          type={passwordVisible ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          invalid={passwordInvalid}
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              className="font-mono text-xs text-[#3652E0] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#8493FF]"
            >
              {passwordVisible ? 'hide' : 'show'}
            </button>
          }
        />

        {errorMessage && (
          <p
            role="alert"
            className="rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-2 text-sm leading-normal text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]"
          >
            {errorMessage}
          </p>
        )}
        {emailNotVerified && (
          <div>
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resendSending}
              className="font-mono text-xs text-[#3652E0] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:no-underline disabled:opacity-60 dark:text-[#8493FF]"
            >
              Resend verification email
            </button>
            {resendStatusMessage && (
              <p role="status" className="mt-2 text-sm text-[#2E7D4F] dark:text-[#6FCF9A]">
                {resendStatusMessage}
              </p>
            )}
            {resendErrorMessage && (
              <p role="alert" className="mt-2 text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
                {resendErrorMessage}
              </p>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-[#3652E0] to-[#5D6EF5] px-5 py-2 text-base font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:opacity-60 dark:from-[#8493FF] dark:to-[#A6B4FF] dark:text-[#14171A]"
        >
          Log in →
        </button>
      </form>

      <p className="text-center text-sm text-[#8B8F86] dark:text-[#6D726A]">
        <Link
          to="/forgot-password"
          className="text-[#5B5F58] underline underline-offset-2 dark:text-[#A2A79C]"
        >
          Forgot password?
        </Link>
      </p>

      <div className="flex items-center gap-3 text-xs text-[#8B8F86] dark:text-[#6D726A]">
        <span className="h-px flex-1 bg-[#DBDFD3] dark:bg-[#2C3130]" />
        or
        <span className="h-px flex-1 bg-[#DBDFD3] dark:bg-[#2C3130]" />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-sm text-[#8B8F86] dark:text-[#6D726A]">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="text-[#5B5F58] underline underline-offset-2 dark:text-[#A2A79C]"
        >
          Sign up now
        </Link>{' '}
        — free, no card required.
      </p>
    </AuthLayout>
  )
}
