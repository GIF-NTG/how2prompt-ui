import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { authClient } from '../api/authClient'
import { useAuth } from '../context/useAuth'

/**
 * Where Google redirects back to after the visitor approves/denies access, per
 * the real authorization-code flow (docs/api/openapi.yaml): `GET /auth/oauth/google`
 * → redirect to Google → Google redirects here with `?code=...&state=...` →
 * this page exchanges them via `authClient.completeGoogleOAuth`.
 */
export function GoogleCallbackPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (!code || !state) {
      setErrorMessage('Thiếu thông tin xác thực từ Google. Vui lòng thử đăng nhập lại.')
      return
    }

    authClient.completeGoogleOAuth(code, state).then((outcome) => {
      if (outcome.status === 'success') {
        if (outcome.session) signIn(outcome.session)
        navigate('/', { replace: true })
      } else {
        setErrorMessage(outcome.message || 'Đăng nhập bằng Google thất bại.')
      }
    })
  }, [navigate, signIn])

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        {errorMessage ? (
          <>
            <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-mono text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
            >
              Quay lại đăng nhập
            </button>
          </>
        ) : (
          <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">
            Đang hoàn tất đăng nhập bằng Google…
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
