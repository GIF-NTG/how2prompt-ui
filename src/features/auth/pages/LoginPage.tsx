import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { InlineBlank } from '../components/InlineBlankForm'
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
  const { signIn } = useAuth()
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

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // A ref-backed guard (not just the `submitting` state) closes the race
    // where a second submit fires before React re-renders the disabled
    // button — state updates aren't synchronous, this ref read is.
    if (submittingRef.current) return
    setErrorMessage(null)

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
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#1B1D1B] dark:text-[#ECEEE8]">Chào bạn quay lại</h2>
        <p className="mt-1 text-sm text-[#5B5F58] dark:text-[#A2A79C]">
          Điền hai ô trống để mở lại phiên làm việc của bạn.
        </p>
      </div>

      {justRegistered && (
        <p
          role="status"
          className="rounded-lg border border-[#3652E0]/30 bg-[#E7EAFC] px-4 py-2 text-sm text-[#3652E0] dark:border-[#8493FF]/30 dark:bg-[#262B4A] dark:text-[#8493FF]"
        >
          Đã tạo tài khoản thành công! Hãy đăng nhập để tiếp tục.
        </p>
      )}

      {passwordWasReset && (
        <p
          role="status"
          className="rounded-lg border border-[#3652E0]/30 bg-[#E7EAFC] px-4 py-2 text-sm text-[#3652E0] dark:border-[#8493FF]/30 dark:bg-[#262B4A] dark:text-[#8493FF]"
        >
          Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-[14px] border border-[#DBDFD3] bg-[#EAEDE6] p-6 text-lg leading-loose text-[#1B1D1B] dark:border-[#2C3130] dark:bg-[#23282C] dark:text-[#ECEEE8]"
      >
        Đăng nhập bằng email{' '}
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
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          invalid={passwordInvalid}
          autoComplete="current-password"
        />{' '}
        <button
          type="button"
          onClick={() => setPasswordVisible((visible) => !visible)}
          className="font-mono text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
        >
          {passwordVisible ? 'ẩn' : 'hiện'}
        </button>
        .{' '}
        <Link
          to="/forgot-password"
          className="text-sm text-[#5B5F58] underline underline-offset-2 dark:text-[#A2A79C]"
        >
          Quên mật khẩu?
        </Link>
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
            className="rounded-lg bg-[#3652E0] px-5 py-2 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A]"
          >
            Đăng nhập →
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
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[#5B5F58] underline underline-offset-2 dark:text-[#A2A79C]">
          Đăng ký ngay
        </Link>{' '}
        — miễn phí, không cần thẻ.
      </p>
    </AuthLayout>
  )
}
