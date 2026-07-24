import type { AuthClient } from './authClient.types'
import type { AuthOutcome, Session } from './types'
import { apiFetch, ApiError } from './httpClient'

const GOOGLE_OAUTH_STATE_KEY = 'how2prompt.auth.google_oauth_state'

interface BackendUser {
  id: string
  email: string
  full_name: string
}

interface AuthResponseBody {
  access_token: string
  expires_in: number
  token_type: string
  user: BackendUser
}

function toSession(body: AuthResponseBody): Session {
  const issuedAt = Date.now()
  return {
    accountId: body.user.id,
    displayName: body.user.full_name,
    email: body.user.email,
    token: body.access_token,
    issuedAt,
    expiresAt: issuedAt + body.expires_in * 1000,
  }
}

function toErrorOutcome(error: unknown, fallbackMessage: string): AuthOutcome {
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
        const body = await apiFetch<AuthResponseBody>('/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        return { status: 'success', session: toSession(body), accountCreated: false }
      } catch (error) {
        return toErrorOutcome(error, 'Không thể đăng nhập, vui lòng thử lại.')
      }
    },

    async register(displayName, email, password) {
      try {
        // The real endpoint returns a full AuthResponse (with tokens), but per
        // FR-013 registering must NOT sign the visitor in — those tokens are
        // deliberately discarded; RegisterPage routes to /login regardless.
        await apiFetch<AuthResponseBody>('/auth/register', {
          method: 'POST',
          body: { email, password, full_name: displayName },
        })
        return { status: 'success', session: null, accountCreated: true }
      } catch (error) {
        return toErrorOutcome(error, 'Không thể tạo tài khoản, vui lòng thử lại.')
      }
    },

    async signInWithGoogle() {
      // Authorization-code + redirect flow (docs/api/openapi.yaml), not the mock's
      // client-side One Tap flow. This call navigates the whole tab away to Google,
      // so it does not meaningfully resolve — GoogleCallbackPage finishes the flow
      // via completeGoogleOAuth() once Google redirects back.
      const { authorization_url, state } = await apiFetch<{ authorization_url: string; state: string }>(
        '/auth/oauth/google',
      )
      window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state)
      window.location.href = authorization_url
      return new Promise<AuthOutcome>(() => {
        // Intentionally never settles — the browser is navigating away.
      })
    },

    async completeGoogleOAuth(code, state) {
      const expectedState = window.sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY)
      window.sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY)
      if (!expectedState || expectedState !== state) {
        return {
          status: 'error',
          errorCode: 'VALIDATION_ERROR',
          message: 'Phiên đăng nhập Google không hợp lệ, vui lòng thử lại.',
        }
      }
      try {
        const body = await apiFetch<AuthResponseBody>('/auth/oauth/google/callback', {
          method: 'POST',
          body: { code, state },
        })
        // The contract doesn't report whether this created a new account or linked
        // an existing one (unlike the mock's accountCreated flag) — default false;
        // FR-019/FR-020's distinct copy isn't reachable via the real flow yet.
        return { status: 'success', session: toSession(body), accountCreated: false }
      } catch (error) {
        return toErrorOutcome(error, 'Không thể đăng nhập bằng Google.')
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
      try {
        const refreshed = await apiFetch<{ access_token: string; expires_in: number }>('/auth/refresh', {
          method: 'POST',
        })
        const profile = await apiFetch<BackendUser>('/users/me', { accessToken: refreshed.access_token })
        return toSession({ ...refreshed, token_type: 'Bearer', user: profile })
      } catch {
        // No valid refresh_token cookie (never logged in, logged out, or expired).
        return null
      }
    },
  }
}
