import type { AuthClient } from './authClient.types'
import type { AuthErrorCode, Session } from './types'
import { apiFetch, ApiError } from '@/shared/utils/httpClient'
import { requestGoogleCredential } from './googleIdentity'

// openapi.yaml documents `emailVerified`/`isAdmin` as booleans, but the live
// backend actually sends `isEmailVerified`/`isAdmin` as the strings "true"/"false"
// — contract drift, normalized via toBool() below rather than adapted in the spec.
interface BackendUser {
  id: string
  email: string
  fullName: string
  isEmailVerified: boolean | string
  /** Epic 5 admin gate — part of the full backend UserProfile schema
   *  (docs/api/openapi.yaml), surfaced into Session (research.md Decision 1). */
  isAdmin: boolean | string
}

function toBool(value: boolean | string): boolean {
  return typeof value === 'string' ? value === 'true' : value
}

// The backend rotates refresh_token on every /auth/refresh call and invalidates the
// old one. React StrictMode (dev) double-invokes AuthProvider's mount effect, which
// fires restoreSession() twice back-to-back; without dedup both requests race with
// the same pre-rotation cookie, the loser's rotation gets rejected, and the *next*
// page reload then presents an already-invalidated cookie — session lost on the
// second refresh even though the first looked fine. Sharing one in-flight promise
// across concurrent callers keeps it to a single /auth/refresh call.
let restoreSessionInFlight: Promise<Session | null> | null = null

/** `GET`/`PATCH /users/me` return the full backend `UserProfile` schema — this
 *  only names the fields US-1.7 reads/writes (plus what `BackendUser` already
 *  covers); other fields (avatarUrl, timezone, plan, ...) are ignored. */
interface BackendUserProfile extends BackendUser {
  username: string | null
  bio: string | null
  locale: 'en' | 'vi'
}

/** `POST /auth/login`, `POST /auth/oauth/google`, `POST /auth/refresh` all return
 *  this — no longer embeds `user` (docs/api/openapi.yaml, research.md Decision 1). */
interface AuthResponseBody {
  accessToken: string
  expiresIn: number
}

function fetchUserProfile(accessToken: string): Promise<BackendUser> {
  return apiFetch<BackendUser>('/users/me', { accessToken })
}

function toSession(authResponse: AuthResponseBody, profile: BackendUser): Session {
  const issuedAt = Date.now()
  return {
    accountId: profile.id,
    displayName: profile.fullName,
    email: profile.email,
    token: authResponse.accessToken,
    issuedAt,
    expiresAt: issuedAt + authResponse.expiresIn * 1000,
    emailVerified: toBool(profile.isEmailVerified),
    isAdmin: toBool(profile.isAdmin),
  }
}

// Typed as just the error branch (not AuthOutcome's full union) so this is
// structurally assignable to every AuthClient outcome type's error shape
// (AuthOutcome, ProfileOutcome, VerifyEmailOutcome, ...) — they all share the
// same `{ status: 'error', errorCode, message }` shape.
function toErrorOutcome(
  error: unknown,
  fallbackMessage: string,
): { status: 'error'; errorCode: AuthErrorCode; message: string } {
  if (error instanceof ApiError) {
    return { status: 'error', errorCode: error.code, message: error.message }
  }
  return { status: 'error', errorCode: 'VALIDATION_ERROR', message: fallbackMessage }
}

/**
 * Real implementation of the single AuthClient integration point (FR-009), against
 * docs/api/openapi.yaml. Activated automatically by authClient.ts once
 * VITE_API_BASE_URL is set — no other file in src/features/auth needs to change.
 */
export function createRealAuthClient(): AuthClient {
  return {
    async login(email, password) {
      try {
        const authResponse = await apiFetch<AuthResponseBody>('/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        const profile = await fetchUserProfile(authResponse.accessToken)
        return {
          status: 'success',
          session: toSession(authResponse, profile),
          accountCreated: false,
        }
      } catch (error) {
        return toErrorOutcome(error, 'Không thể đăng nhập, vui lòng thử lại.')
      }
    },

    async register(displayName, email, password) {
      try {
        // The real endpoint returns a RegisterResponse (no tokens at all — per
        // docs/api/openapi.yaml, registering must NOT sign the visitor in);
        // RegisterPage routes to /login regardless.
        await apiFetch<{ user: BackendUser; message: string }>('/auth/register', {
          method: 'POST',
          body: { email, password, fullName: displayName },
        })
        return { status: 'success', session: null, accountCreated: true }
      } catch (error) {
        return toErrorOutcome(error, 'Không thể tạo tài khoản, vui lòng thử lại.')
      }
    },

    async signInWithGoogle(options) {
      // Single-request ID-token flow (docs/api/openapi.yaml) — no authorization-code
      // redirect/callback round trip. `options` (e.g. `simulate: 'cancel'`) is a
      // mock-only testing hook, ignored here.
      void options
      // Deliberately NOT inside the try/catch below: requestGoogleCredential()
      // throws a specific, actionable diagnostic (misconfigured client id,
      // unregistered origin, blocked third-party cookies, etc. — see
      // googleIdentity.ts) that must reach the caller as-is, not get flattened
      // into toErrorOutcome's generic fallback message. GoogleSignInButton
      // already catches and displays exactly this kind of rejection.
      const credential = await requestGoogleCredential()
      if (!credential) {
        // Visitor genuinely dismissed/cancelled the prompt — no error shown
        // (mirrors the mock's identical empty-message outcome).
        return { status: 'error', errorCode: 'VALIDATION_ERROR', message: '' }
      }
      try {
        const authResponse = await apiFetch<AuthResponseBody>('/auth/oauth/google', {
          method: 'POST',
          body: { idToken: credential.idToken },
        })
        const profile = await fetchUserProfile(authResponse.accessToken)
        // The contract doesn't report whether this created a new account or linked
        // an existing one (unlike the mock's accountCreated flag) — default false;
        // FR-019/FR-020's distinct copy isn't reachable via the real flow yet.
        return {
          status: 'success',
          session: toSession(authResponse, profile),
          accountCreated: false,
        }
      } catch (error) {
        return toErrorOutcome(error, 'Không thể đăng nhập bằng Google.')
      }
    },

    async requestPasswordReset(email) {
      try {
        await apiFetch<void>('/auth/forgot-password', { method: 'POST', body: { email } })
        return { status: 'success' }
      } catch (error) {
        return toErrorOutcome(error, 'Không thể gửi yêu cầu, vui lòng thử lại.')
      }
    },

    async resetPassword(token, newPassword) {
      try {
        await apiFetch<void>('/auth/reset-password', {
          method: 'POST',
          body: { token, newPassword },
        })
        return { status: 'success' }
      } catch (error) {
        // The contract documents only the 410 status for an expired/already-used
        // token, not a specific error.code (research.md Decision 1) — branch on
        // status rather than guessing a code.
        if (error instanceof ApiError && error.status === 410) {
          return {
            status: 'error',
            errorCode: 'RESET_TOKEN_EXPIRED',
            message: 'Liên kết đã hết hạn hoặc đã được sử dụng.',
          }
        }
        return toErrorOutcome(error, 'Không thể đặt lại mật khẩu, vui lòng thử lại.')
      }
    },

    async verifyEmail(token) {
      try {
        await apiFetch<void>('/auth/verify-email', { method: 'POST', body: { token } })
        return { status: 'success' }
      } catch (error) {
        // The contract documents only the 410 status for an expired/already-used
        // token, not a specific error.code (mirrors research.md Decision 1 from
        // 001-us1.5-forgot-reset-password's resetPassword) — branch on status.
        if (error instanceof ApiError && error.status === 410) {
          return {
            status: 'error',
            errorCode: 'VERIFY_TOKEN_EXPIRED',
            message: 'Liên kết đã hết hạn hoặc đã được sử dụng.',
          }
        }
        return toErrorOutcome(error, 'Không thể xác minh email, vui lòng thử lại.')
      }
    },

    async resendVerificationEmail(email) {
      try {
        // The contract answers 202 Accepted (queued for async delivery), not 200 —
        // apiFetch's `!response.ok` check already treats any 2xx as success, so no
        // status-code branching is needed here (research.md Decision 4). Public
        // request — no accessToken, identifies the account by email in the body.
        await apiFetch<void>('/auth/resend-verification', { method: 'POST', body: { email } })
        return { status: 'success' }
      } catch (error) {
        if (error instanceof ApiError && error.status === 429) {
          return {
            status: 'error',
            errorCode: 'RATE_LIMITED',
            message: 'Bạn vừa yêu cầu gửi lại, vui lòng đợi vài phút rồi thử lại.',
          }
        }
        return toErrorOutcome(error, 'Không thể gửi lại email xác minh, vui lòng thử lại.')
      }
    },

    async logout() {
      try {
        await apiFetch<void>('/auth/logout', { method: 'POST' })
      } catch {
        // Best-effort — the caller clears local session state regardless.
      }
    },

    async restoreSession() {
      if (restoreSessionInFlight) return restoreSessionInFlight

      restoreSessionInFlight = (async () => {
        try {
          const authResponse = await apiFetch<AuthResponseBody>('/auth/refresh', {
            method: 'POST',
          })
          const profile = await fetchUserProfile(authResponse.accessToken)
          return toSession(authResponse, profile)
        } catch {
          // No valid refresh_token cookie (never logged in, logged out, or expired).
          return null
        } finally {
          restoreSessionInFlight = null
        }
      })()

      return restoreSessionInFlight
    },

    async getProfile(accessToken) {
      try {
        const body = await apiFetch<BackendUserProfile>('/users/me', { accessToken })
        return {
          status: 'success',
          profile: {
            fullName: body.fullName,
            username: body.username,
            bio: body.bio,
            locale: body.locale,
          },
        }
      } catch (error) {
        return toErrorOutcome(error, 'Không thể tải hồ sơ, vui lòng thử lại.')
      }
    },

    async updateProfile(accessToken, input) {
      try {
        const body = await apiFetch<BackendUserProfile>('/users/me', {
          method: 'PATCH',
          accessToken,
          body: input,
        })
        return {
          status: 'success',
          profile: {
            fullName: body.fullName,
            username: body.username,
            bio: body.bio,
            locale: body.locale,
          },
        }
      } catch (error) {
        // The contract documents only the 409 status for a duplicate username, not
        // a specific error.code (research.md Decision 3) — branch on status.
        if (error instanceof ApiError && error.status === 409) {
          return {
            status: 'error',
            errorCode: 'USERNAME_TAKEN',
            message: 'Tên người dùng này đã được sử dụng.',
          }
        }
        return toErrorOutcome(error, 'Không thể cập nhật hồ sơ, vui lòng thử lại.')
      }
    },
  }
}
