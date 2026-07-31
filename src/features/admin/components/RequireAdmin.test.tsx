import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RequireAdmin } from './RequireAdmin'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'

const ADMIN_SESSION: Session = {
  accountId: 'admin-account',
  displayName: 'Quản trị viên Demo',
  email: 'admin@how2prompt.dev',
  token: 'admin-token',
  issuedAt: Date.now(),
  expiresAt: Date.now() + 900_000,
  emailVerified: true,
  isAdmin: true,
}

const USER_SESSION: Session = { ...ADMIN_SESSION, accountId: 'user-account', isAdmin: false }

function makeAuthValue(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    session: null,
    isRestoring: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    resendVerificationEmail: vi.fn(),
    verifyEmail: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    ...overrides,
  }
}

function renderGuard(authValue: AuthContextValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/admin/ai-models']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/" element={<div>Home page</div>} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin/ai-models" element={<div>Admin content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('RequireAdmin', () => {
  it('renders nothing while the session is still restoring', () => {
    renderGuard(makeAuthValue({ session: null, isRestoring: true }))
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()
  })

  it('redirects an unauthenticated visitor to /login', () => {
    renderGuard(makeAuthValue({ session: null, isRestoring: false }))
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('redirects an authenticated non-admin to /', () => {
    renderGuard(makeAuthValue({ session: USER_SESSION, isRestoring: false }))
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('renders the outlet for an authenticated admin', () => {
    renderGuard(makeAuthValue({ session: ADMIN_SESSION, isRestoring: false }))
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })
})
