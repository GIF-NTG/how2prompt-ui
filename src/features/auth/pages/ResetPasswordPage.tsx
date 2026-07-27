import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { InlineBlank } from '../components/InlineBlankForm'
import { AuthLayout } from '../components/AuthLayout'
import { authClient } from '../api/authClient'

const MIN_PASSWORD_LENGTH = 8

export function ResetPasswordPage() {
  const navigate = useNavigate()
  // Re-read on every render (and thus every mount/navigation) — the token is
  // re-validated from the URL each time this page loads, including a back-button
  // return to an already-used link (spec Edge Case).
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [passwordInvalid, setPasswordInvalid] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [linkExpired, setLinkExpired] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const passwordRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    setErrorMessage(null)
    setLinkExpired(false)

    const isPasswordTooShort = password.length < MIN_PASSWORD_LENGTH
    setPasswordInvalid(isPasswordTooShort)
    if (isPasswordTooShort) {
      passwordRef.current?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      const outcome = await authClient.resetPassword(token, password)
      if (outcome.status === 'success') {
        navigate('/login', { state: { passwordWasReset: true } })
      } else if (outcome.errorCode === 'RESET_TOKEN_EXPIRED') {
        setLinkExpired(true)
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
        <h2 className="text-xl font-bold tracking-tight text-[#1B1D1B] dark:text-[#ECEEE8]">Đặt lại mật khẩu</h2>
        <p className="mt-1 text-sm text-[#5B5F58] dark:text-[#A2A79C]">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      {linkExpired ? (
        <div className="rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-3 text-sm leading-normal text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]">
          Liên kết đã hết hạn hoặc đã được sử dụng.{' '}
          <Link to="/forgot-password" className="underline underline-offset-2">
            Yêu cầu liên kết mới
          </Link>
          .
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[14px] border border-[#DBDFD3] bg-[#EAEDE6] p-6 text-lg leading-loose text-[#1B1D1B] dark:border-[#2C3130] dark:bg-[#23282C] dark:text-[#ECEEE8]"
        >
          Mật khẩu mới{' '}
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
            className="font-mono text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
          >
            {passwordVisible ? 'ẩn' : 'hiện'}
          </button>
          .
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
              Đặt lại mật khẩu →
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
