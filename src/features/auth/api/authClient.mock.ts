import type { Session } from './types'
import type { AuthClient } from './authClient.types'
import { requestGoogleCredential } from './googleIdentity'

// Exported for tests only — production code must go through AuthContext /
// authClient, never read or write this key directly (contracts/auth-client.md).
export const SESSION_STORAGE_KEY = 'how2prompt.auth.session'
// 7 days is an UNVERIFIED placeholder inherited from the submodule's original SRS
// (before docs/api/openapi.yaml existed). The real contract only confirms
// access_token = 15 minutes; refresh_token's actual lifetime is set server-side in
// an httpOnly cookie and is not documented anywhere the frontend can read — this
// mock's single-token model stands in for "how long you stay logged in overall"
// (i.e. the refresh_token's real-world equivalent), not a confirmed number.
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

// Demo credentials, seeded into the mock account store below.
const DEMO_EMAIL = 'demo@how2prompt.dev'
const DEMO_PASSWORD = 'demo1234'
const DEMO_DISPLAY_NAME = 'Người dùng Demo'

interface MockAccountRecord {
  id: string
  displayName: string
  email: string
  /** Absent for accounts that only ever signed in via Google. */
  password?: string
  emailVerified: boolean
  /** Epoch ms of the last resend-verification call, for the mock's rate-limit
   *  simulation (see resendVerificationEmail below). */
  lastVerificationSentAt?: number
  /** Profile fields editable via US-1.7 (see getProfile/updateProfile below). */
  username: string | null
  bio: string | null
  locale: 'en' | 'vi'
}

// Mock cooldown window for the "resend verification email" rate limit — short
// enough that a test can hit the RATE_LIMITED branch with two back-to-back calls,
// unlike the real backend's actual 5-minute window (research.md/contracts don't
// mandate a specific mock duration, just that a rapid second call is rejected).
const MOCK_RESEND_COOLDOWN_MS = 5 * 60 * 1000

// In-memory mock account store (US2/US4). Reset on page reload — there is no
// backend yet, only the currently open tab's session persists (localStorage).
const mockAccounts = new Map<string, MockAccountRecord>([
  [
    DEMO_EMAIL,
    {
      id: 'demo-account',
      displayName: DEMO_DISPLAY_NAME,
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      emailVerified: true,
      username: null,
      bio: null,
      locale: 'vi',
    },
  ],
])

function createAccountId(): string {
  return `account.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`
}

function readStoredSession(): Session | null {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function persistSession(session: Session): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function clearStoredSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

function createSession(account: { id: string; displayName: string; email: string; emailVerified: boolean }): Session {
  const issuedAt = Date.now()
  return {
    accountId: account.id,
    displayName: account.displayName,
    email: account.email,
    token: `mock-token.${issuedAt}.${Math.random().toString(36).slice(2)}`,
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_MS,
    emailVerified: account.emailVerified,
  }
}

export function createMockAuthClient(): AuthClient {
  return {
    async login(email, password) {
      const account = mockAccounts.get(email)
      if (account?.password && account.password === password) {
        const session = createSession(account)
        persistSession(session)
        return { status: 'success', session, accountCreated: false }
      }
      return {
        status: 'error',
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không chính xác',
      }
    },
    async register(displayName, email, password) {
      if (mockAccounts.has(email)) {
        return {
          status: 'error',
          errorCode: 'EMAIL_ALREADY_EXISTS',
          message: 'Email này đã được đăng ký, hãy đăng nhập',
        }
      }
      mockAccounts.set(email, {
        id: createAccountId(),
        displayName,
        email,
        password,
        emailVerified: false,
        username: null,
        bio: null,
        locale: 'vi',
      })
      return { status: 'success', session: null, accountCreated: true }
    },
    async signInWithGoogle(options) {
      if (options?.simulate === 'cancel') {
        return { status: 'error', errorCode: 'VALIDATION_ERROR', message: '' }
      }

      // Real Google account picker (One Tap) — the credential's signature is
      // NOT verified here, since there is no backend yet to do that.
      const credential = await requestGoogleCredential()
      if (!credential?.email) {
        return { status: 'error', errorCode: 'VALIDATION_ERROR', message: '' }
      }

      const existing = mockAccounts.get(credential.email)
      if (existing) {
        const session = createSession(existing)
        persistSession(session)
        return { status: 'success', session, accountCreated: false }
      }

      const account: MockAccountRecord = {
        id: createAccountId(),
        displayName: credential.name || credential.email,
        email: credential.email,
        // Google already verifies account ownership of the email itself.
        emailVerified: true,
        username: null,
        bio: null,
        locale: 'vi',
      }
      mockAccounts.set(credential.email, account)
      const session = createSession(account)
      persistSession(session)
      return { status: 'success', session, accountCreated: true }
    },
    async requestPasswordReset() {
      // Always succeeds for a well-formed email, regardless of whether it matches
      // a mock account — deliberately mirrors the real endpoint's no-enumeration
      // behavior instead of looking the email up in mockAccounts.
      return { status: 'success' }
    },
    async resetPassword(token, newPassword) {
      // Sentinel token to exercise the expired/used-link branch without a real
      // backend — see contracts/auth-client.md "Mock implementation notes".
      if (token === 'expired-token') {
        return {
          status: 'error',
          errorCode: 'RESET_TOKEN_EXPIRED',
          message: 'Liên kết đã hết hạn hoặc đã được sử dụng.',
        }
      }
      const account = [...mockAccounts.values()].find((entry) => entry.password !== undefined)
      if (account) account.password = newPassword
      return { status: 'success' }
    },
    async verifyEmail(token) {
      // Sentinel token to exercise the expired/used-link branch without a real
      // backend — see contracts/auth-client.md "Mock implementation notes".
      if (token === 'expired-token') {
        return {
          status: 'error',
          errorCode: 'VERIFY_TOKEN_EXPIRED',
          message: 'Liên kết đã hết hạn hoặc đã được sử dụng.',
        }
      }
      // The mock has no real token↔account mapping (it never issued a real token),
      // so it marks the currently stored session's account verified, if any — mirrors
      // resetPassword's mock updating "the matching demo account" precedent.
      const session = readStoredSession()
      if (session) {
        const account = [...mockAccounts.values()].find((entry) => entry.email === session.email)
        if (account) account.emailVerified = true
        persistSession({ ...session, emailVerified: true })
      }
      return { status: 'success' }
    },
    async resendVerificationEmail() {
      const session = readStoredSession()
      const account = session ? [...mockAccounts.values()].find((entry) => entry.email === session.email) : undefined
      const now = Date.now()
      if (account?.lastVerificationSentAt && now - account.lastVerificationSentAt < MOCK_RESEND_COOLDOWN_MS) {
        return {
          status: 'error',
          errorCode: 'RATE_LIMITED',
          message: 'Bạn vừa yêu cầu gửi lại, vui lòng đợi vài phút rồi thử lại.',
        }
      }
      if (account) account.lastVerificationSentAt = now
      return { status: 'success' }
    },
    async getProfile() {
      // Looks up by the currently persisted session's email (same pattern as
      // verifyEmail/resendVerificationEmail) rather than the accessToken value
      // itself, which the mock never stores on the account record.
      const session = readStoredSession()
      const account = session ? [...mockAccounts.values()].find((entry) => entry.email === session.email) : undefined
      if (!account) {
        return { status: 'error', errorCode: 'TOKEN_EXPIRED', message: 'Phiên đăng nhập đã hết hạn.' }
      }
      return {
        status: 'success',
        profile: { fullName: account.displayName, username: account.username, bio: account.bio, locale: account.locale },
      }
    },
    async updateProfile(_accessToken, input) {
      const session = readStoredSession()
      const account = session ? [...mockAccounts.values()].find((entry) => entry.email === session.email) : undefined
      if (!account) {
        return { status: 'error', errorCode: 'TOKEN_EXPIRED', message: 'Phiên đăng nhập đã hết hạn.' }
      }
      if (input.username) {
        const collision = [...mockAccounts.values()].find(
          (entry) => entry !== account && entry.username === input.username,
        )
        if (collision) {
          return { status: 'error', errorCode: 'USERNAME_TAKEN', message: 'Tên người dùng này đã được sử dụng.' }
        }
      }
      account.displayName = input.fullName
      account.username = input.username
      account.bio = input.bio
      account.locale = input.locale
      return {
        status: 'success',
        profile: { fullName: account.displayName, username: account.username, bio: account.bio, locale: account.locale },
      }
    },
    async logout() {
      clearStoredSession()
    },
    async restoreSession() {
      const session = readStoredSession()
      if (!session) return null
      if (session.expiresAt <= Date.now()) {
        clearStoredSession()
        return null
      }
      return session
    },
  }
}
