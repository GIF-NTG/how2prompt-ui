import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { InlineBlank } from '../components/InlineBlankForm'
import { AuthLayout } from '../components/AuthLayout'
import { authClient } from '../api/authClient'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    setErrorMessage(null)

    const trimmedEmail = email.trim()
    const isEmailEmpty = trimmedEmail.length === 0
    const isEmailMalformed = !isEmailEmpty && !EMAIL_PATTERN.test(trimmedEmail)

    setEmailInvalid(isEmailEmpty || isEmailMalformed)

    if (isEmailEmpty || isEmailMalformed) {
      emailRef.current?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      const outcome = await authClient.requestPasswordReset(trimmedEmail)
      if (outcome.status === 'success') {
        // Identical confirmation regardless of whether the email matched an
        // account (FR-002) — the outcome type has no way to say "not found",
        // by design.
        setRequestSent(true)
      } else {
        // A genuine failure (network/unexpected) — shown inline, not folded
        // into the generic confirmation above (FR-005).
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
          Quên mật khẩu
        </h2>
        <p className="mt-1 text-sm text-[#5B5F58] dark:text-[#A2A79C]">
          Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
        </p>
      </div>

      {requestSent ? (
        <p
          role="status"
          className="rounded-lg border border-[#3652E0]/30 bg-[#E7EAFC] px-4 py-2 text-sm text-[#3652E0] dark:border-[#8493FF]/30 dark:bg-[#262B4A] dark:text-[#8493FF]"
        >
          Nếu email này tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi tới.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[14px] border border-[#DBDFD3] bg-[#EAEDE6] p-6 text-lg leading-loose text-[#1B1D1B] dark:border-[#2C3130] dark:bg-[#23282C] dark:text-[#ECEEE8]"
        >
          Gửi liên kết đặt lại mật khẩu tới email{' '}
          <InlineBlank
            ref={emailRef}
            type="email"
            placeholder="ban@vidu.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            invalid={emailInvalid}
            autoComplete="email"
          />
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
              Gửi liên kết →
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-[#8B8F86] dark:text-[#6D726A]">
        Nhớ ra mật khẩu rồi?{' '}
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
