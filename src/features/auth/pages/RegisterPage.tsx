import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { InlineBlank } from '../components/InlineBlankForm'
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
          Tạo tài khoản Member
        </h2>
        <p className="mt-1 text-sm text-[#5B5F58] dark:text-[#A2A79C]">
          Ba ô trống, một tài khoản để lưu toàn bộ lịch sử prompt.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-card border border-[#DBDFD3] bg-[#EAEDE6] p-6 text-lg leading-loose text-[#1B1D1B] dark:border-[#2C3130] dark:bg-[#23282C] dark:text-[#ECEEE8]"
      >
        Tôi tên là{' '}
        <InlineBlank
          ref={nameRef}
          type="text"
          placeholder="tên hiển thị"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          invalid={nameInvalid}
          autoComplete="name"
        />
        , dùng email{' '}
        <InlineBlank
          ref={emailRef}
          type="email"
          placeholder="ban@vidu.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={emailInvalid}
          autoComplete="email"
        />{' '}
        và mật khẩu{' '}
        <InlineBlank
          ref={passwordRef}
          type={passwordVisible ? 'text' : 'password'}
          placeholder="tối thiểu 8 ký tự"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          invalid={passwordInvalid}
          autoComplete="new-password"
        />{' '}
        <button
          type="button"
          onClick={() => setPasswordVisible((visible) => !visible)}
          className="font-mono text-xs text-[#3652E0] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#8493FF]"
        >
          {passwordVisible ? 'ẩn' : 'hiện'}
        </button>{' '}
        để mở tài khoản.
        {errorMessage && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-2 text-sm leading-normal text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]"
          >
            {errorMessage}
          </p>
        )}
        <div className="mt-5">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-[#3652E0] to-[#5D6EF5] px-5 py-2 text-base font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:opacity-60 dark:from-[#8493FF] dark:to-[#A6B4FF] dark:text-[#14171A]"
          >
            Đăng ký →
          </button>
        </div>
      </form>

      <div className="flex items-center gap-3 text-xs text-[#8B8F86] dark:text-[#6D726A]">
        <span className="h-px flex-1 bg-[#DBDFD3] dark:bg-[#2C3130]" />
        hoặc
        <span className="h-px flex-1 bg-[#DBDFD3] dark:bg-[#2C3130]" />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-sm text-[#8B8F86] dark:text-[#6D726A]">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="text-[#5B5F58] underline underline-offset-2 dark:text-[#A2A79C]"
        >
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  )
}
