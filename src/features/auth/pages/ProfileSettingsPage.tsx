import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/useAuth'

const FULL_NAME_MAX_LENGTH = 150
const USERNAME_MAX_LENGTH = 50

const FIELD_CLASSES =
  'rounded-lg border bg-transparent px-3 py-2 text-base text-[#1B1D1B] focus:outline-none dark:text-[#ECEEE8]'
const FIELD_BORDER = 'border-[#DBDFD3] focus:border-[#3652E0] dark:border-[#2C3130] dark:focus:border-[#8493FF]'
const FIELD_BORDER_INVALID = 'border-[#C23A2E] dark:border-[#FF7A6B]'

/**
 * Requires an active session (US-1.7, FR-001). Waits for `isRestoring` to
 * settle before deciding whether to redirect — checking `session === null`
 * alone would incorrectly redirect an already-logged-in user during a page
 * reload/direct navigation while the real backend's cookie-based session
 * restore is still in flight (research.md Decision 6).
 */
export function ProfileSettingsPage() {
  const { session, isRestoring, getProfile, updateProfile } = useAuth()

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [locale, setLocale] = useState<'en' | 'vi'>('vi')

  const [fullNameError, setFullNameError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    getProfile().then((outcome) => {
      if (cancelled) return
      if (outcome.status === 'success') {
        setFullName(outcome.profile.fullName)
        setUsername(outcome.profile.username ?? '')
        setBio(outcome.profile.bio ?? '')
        setLocale(outcome.profile.locale)
      } else {
        setErrorMessage(outcome.message)
      }
      setLoadingProfile(false)
    })
    return () => {
      cancelled = true
    }
  }, [session, getProfile])

  // Wait for the initial session restore before deciding anything — see the
  // doc comment above and research.md Decision 6.
  if (isRestoring) return null
  if (!session) return <Navigate to="/login" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return

    setErrorMessage(null)
    setSuccessMessage(null)
    setFullNameError(null)
    setUsernameError(null)

    const trimmedFullName = fullName.trim()
    const trimmedUsername = username.trim()
    const trimmedBio = bio.trim()

    const isFullNameEmpty = trimmedFullName.length === 0
    const isFullNameTooLong = trimmedFullName.length > FULL_NAME_MAX_LENGTH
    const isUsernameTooLong = trimmedUsername.length > USERNAME_MAX_LENGTH

    if (isFullNameEmpty) {
      setFullNameError('Tên hiển thị không được để trống.')
    } else if (isFullNameTooLong) {
      setFullNameError(`Tên hiển thị tối đa ${FULL_NAME_MAX_LENGTH} ký tự.`)
    }
    if (isUsernameTooLong) {
      setUsernameError(`Tên người dùng tối đa ${USERNAME_MAX_LENGTH} ký tự.`)
    }

    if (isFullNameEmpty || isFullNameTooLong || isUsernameTooLong) return

    submittingRef.current = true
    setSubmitting(true)
    try {
      const outcome = await updateProfile({
        fullName: trimmedFullName,
        username: trimmedUsername.length > 0 ? trimmedUsername : null,
        bio: trimmedBio.length > 0 ? trimmedBio : null,
        locale,
      })
      if (outcome.status === 'success') {
        setFullName(outcome.profile.fullName)
        setUsername(outcome.profile.username ?? '')
        setBio(outcome.profile.bio ?? '')
        setLocale(outcome.profile.locale)
        setSuccessMessage('Đã lưu thay đổi.')
      } else if (outcome.errorCode === 'USERNAME_TAKEN') {
        setUsernameError(outcome.message)
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
        <h2 className="text-xl font-bold tracking-tight text-[#1B1D1B] dark:text-[#ECEEE8]">Hồ sơ cá nhân</h2>
      </div>

      {loadingProfile ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Đang tải hồ sơ...</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5B5F58] dark:text-[#A2A79C]">Tên hiển thị</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={`${FIELD_CLASSES} ${fullNameError ? FIELD_BORDER_INVALID : FIELD_BORDER}`}
            />
            {fullNameError && (
              <span role="alert" className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]">
                {fullNameError}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5B5F58] dark:text-[#A2A79C]">Tên người dùng (tuỳ chọn)</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={`${FIELD_CLASSES} ${usernameError ? FIELD_BORDER_INVALID : FIELD_BORDER}`}
            />
            {usernameError && (
              <span role="alert" className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]">
                {usernameError}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5B5F58] dark:text-[#A2A79C]">Giới thiệu (tuỳ chọn)</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={3}
              className={`${FIELD_CLASSES} ${FIELD_BORDER}`}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5B5F58] dark:text-[#A2A79C]">Ngôn ngữ</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as 'en' | 'vi')}
              className={`${FIELD_CLASSES} ${FIELD_BORDER}`}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-2 text-sm text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]"
            >
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p
              role="status"
              className="rounded-lg border border-[#2E7D4F]/30 bg-[#E4F3EA] px-4 py-2 text-sm text-[#2E7D4F] dark:border-[#6FCF9A]/30 dark:bg-[#1E3327] dark:text-[#6FCF9A]"
            >
              {successMessage}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#3652E0] px-5 py-2 text-base font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A]"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
