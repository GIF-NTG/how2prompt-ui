import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthTextField } from '../components/AuthTextField'
import { AuthLayout } from '../components/AuthLayout'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { authClient } from '../api/authClient'
import { useAuth } from '../context/useAuth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export function RegisterPage() {
  const navigate = useNavigate()
  const { session, isRestoring } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)

  const [nameInvalid, setNameInvalid] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [passwordInvalid, setPasswordInvalid] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)

  // Wait for the initial session restore before deciding anything (mirrors
  // LoginPage's isRestoring gate) — otherwise a signed-in visitor who
  // navigates back to /register would see the form instead of being sent home.
  if (isRestoring) return null
  if (session) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Ref-backed guard — see LoginPage.tsx for why this must be a ref, not
    // just the `submitting` state (avoids a re-render-timing race).
    if (submittingRef.current) return
    setErrorMessage(null)

    const trimmedName = displayName.trim()
    const trimmedEmail = email.trim()

    const isNameEmpty = trimmedName.length === 0
    const isEmailEmpty = trimmedEmail.length === 0
    const isEmailMalformed = !isEmailEmpty && !EMAIL_PATTERN.test(trimmedEmail)
    const isPasswordTooShort = password.length < MIN_PASSWORD_LENGTH

    setNameInvalid(isNameEmpty)
    setEmailInvalid(isEmailEmpty || isEmailMalformed)
    setPasswordInvalid(isPasswordTooShort)

    if (isNameEmpty) {
      nameRef.current?.focus()
      return
    }
    if (isEmailEmpty || isEmailMalformed) {
      emailRef.current?.focus()
      return
    }
    if (isPasswordTooShort) {
      passwordRef.current?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      const outcome = await authClient.register(trimmedName, trimmedEmail, password)
      if (outcome.status === 'success') {
        navigate('/login', { state: { justRegistered: true } })
      } else {
        setErrorMessage(outcome.message)
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#1B1D1B] dark:text-[#ECEEE8]">
          Create a Member account
        </h2>
        <p className="mt-1 text-sm text-[#5B5F58] dark:text-[#A2A79C]">
          One account to save your entire prompt history.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <AuthTextField
          ref={nameRef}
          name="name"
          label="Display name"
          type="text"
          placeholder="display name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          invalid={nameInvalid}
          autoComplete="name"
        />

        <AuthTextField
          ref={emailRef}
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={emailInvalid}
          autoComplete="email"
        />

        <AuthTextField
          ref={passwordRef}
          name="password"
          label="Password"
          type={passwordVisible ? 'text' : 'password'}
          placeholder="at least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          invalid={passwordInvalid}
          autoComplete="new-password"
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

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-[#3652E0] to-[#5D6EF5] px-5 py-2 text-base font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:opacity-60 dark:from-[#8493FF] dark:to-[#A6B4FF] dark:text-[#14171A]"
        >
          Sign up →
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-[#8B8F86] dark:text-[#6D726A]">
        <span className="h-px flex-1 bg-[#DBDFD3] dark:bg-[#2C3130]" />
        or
        <span className="h-px flex-1 bg-[#DBDFD3] dark:bg-[#2C3130]" />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-sm text-[#8B8F86] dark:text-[#6D726A]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[#5B5F58] underline underline-offset-2 dark:text-[#A2A79C]"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
