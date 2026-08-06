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
const DEMO_DISPLAY_NAME = 'Demo User'

// Admin demo credentials — the only mock account with isAdmin: true, so Epic 5's
// RequireAdmin guard and admin nav entry are exercisable without a real backend.
const ADMIN_EMAIL = 'admin@how2prompt.dev'
const ADMIN_PASSWORD = 'admin1234'
const ADMIN_DISPLAY_NAME = 'Demo Admin'

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
  /** Epic 5 admin gate — not editable via any UI, seeded per account. */
  isAdmin: boolean
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
      isAdmin: false,
    },
  ],
  [
    ADMIN_EMAIL,
    {
      id: 'admin-account',
      displayName: ADMIN_DISPLAY_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      emailVerified: true,
      username: null,
      bio: null,
      locale: 'vi',
      isAdmin: true,
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

function createSession(account: {
  id: string
  displayName: string
  email: string
  emailVerified: boolean
  isAdmin: boolean
}): Session {
  const issuedAt = Date.now()
  return {
    accountId: account.id,
    displayName: account.displayName,
    email: account.email,
    token: `mock-token.${issuedAt}.${Math.random().toString(36).slice(2)}`,
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_MS,
    emailVerified: account.emailVerified,
    isAdmin: account.isAdmin,
  }
}

export function createMockAuthClient(): AuthClient {
  return {
    async login(email, password) {
      const account = mockAccounts.get(email)
      if (account?.password && account.password === password) {
        if (!account.emailVerified) {
          return {
            status: 'error',
            errorCode: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email before logging in.',
          }
        }
        const session = createSession(account)
        persistSession(session)
        return { status: 'success', session, accountCreated: false }
      }
      return {
        status: 'error',
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Incorrect email or password',
      }
    },
    async register(displayName, email, password) {
      if (mockAccounts.has(email)) {
        return {
          status: 'error',
          errorCode: 'EMAIL_ALREADY_EXISTS',
          message: 'This email is already registered, please log in',
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
        isAdmin: false,
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
        isAdmin: false,
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
          message: 'This link has expired or has already been used.',
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
          message: 'This link has expired or has already been used.',
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
    async resendVerificationEmail(email) {
      const account = mockAccounts.get(email)
      const now = Date.now()
      if (
        account?.lastVerificationSentAt &&
        now - account.lastVerificationSentAt < MOCK_RESEND_COOLDOWN_MS
      ) {
        return {
          status: 'error',
          errorCode: 'RATE_LIMITED',
          message: 'You just requested a resend — please wait a few minutes and try again.',
        }
      }
      if (account) account.lastVerificationSentAt = now
      return { status: 'success' }
    },
    async getProfile() {
      // Looks up by the currently persisted session's email (same pattern as
      // verifyEmail) rather than the accessToken value itself, which the mock
      // never stores on the account record.
      const session = readStoredSession()
      const account = session
        ? [...mockAccounts.values()].find((entry) => entry.email === session.email)
        : undefined
      if (!account) {
        return {
          status: 'error',
          errorCode: 'TOKEN_EXPIRED',
          message: 'Your session has expired.',
        }
      }
      return {
        status: 'success',
        profile: {
          fullName: account.displayName,
          username: account.username,
          bio: account.bio,
          locale: account.locale,
        },
      }
    },
    async updateProfile(_accessToken, input) {
      const session = readStoredSession()
      const account = session
        ? [...mockAccounts.values()].find((entry) => entry.email === session.email)
        : undefined
      if (!account) {
        return {
          status: 'error',
          errorCode: 'TOKEN_EXPIRED',
          message: 'Your session has expired.',
        }
      }
      if (input.username) {
        const collision = [...mockAccounts.values()].find(
          (entry) => entry !== account && entry.username === input.username,
        )
        if (collision) {
          return {
            status: 'error',
            errorCode: 'USERNAME_TAKEN',
            message: 'This username is already taken.',
          }
        }
      }
      account.displayName = input.fullName
      account.username = input.username
      account.bio = input.bio
      account.locale = input.locale
      return {
        status: 'success',
        profile: {
          fullName: account.displayName,
          username: account.username,
          bio: account.bio,
          locale: account.locale,
        },
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
