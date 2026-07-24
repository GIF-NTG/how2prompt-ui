import type { Session } from './types'
import type { AuthClient } from './authClient.types'
import { requestGoogleCredential } from './googleIdentity'

// Exported for tests only — production code must go through AuthContext /
// authClient, never read or write this key directly (contracts/auth-client.md).
export const SESSION_STORAGE_KEY = 'how2prompt.auth.session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // mirrors the real system's 7-day JWT lifetime

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
}

// In-memory mock account store (US2/US4). Reset on page reload — there is no
// backend yet, only the currently open tab's session persists (localStorage).
const mockAccounts = new Map<string, MockAccountRecord>([
  [DEMO_EMAIL, { id: 'demo-account', displayName: DEMO_DISPLAY_NAME, email: DEMO_EMAIL, password: DEMO_PASSWORD }],
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

function createSession(account: { id: string; displayName: string; email: string }): Session {
  const issuedAt = Date.now()
  return {
    accountId: account.id,
    displayName: account.displayName,
    email: account.email,
    token: `mock-token.${issuedAt}.${Math.random().toString(36).slice(2)}`,
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_MS,
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
          errorCode: 'EMAIL_ALREADY_REGISTERED',
          message: 'Email này đã được đăng ký, hãy đăng nhập',
        }
      }
      mockAccounts.set(email, { id: createAccountId(), displayName, email, password })
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
      }
      mockAccounts.set(credential.email, account)
      const session = createSession(account)
      persistSession(session)
      return { status: 'success', session, accountCreated: true }
    },
    async logout() {
      clearStoredSession()
    },
    restoreSession() {
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
