import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RequireAdmin } from './RequireAdmin'
import { useAuth } from '@/features/auth/context/useAuth'
import type { Session } from '@/features/auth/api/types'

vi.mock('@/features/auth/context/useAuth')

const mockUseAuth = vi.mocked(useAuth)

function baseSession(overrides: Partial<Session> = {}): Session {
  return {
    accountId: 'acc-1',
    displayName: 'Test User',
    email: 'test@example.com',
    token: 'token',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60_000,
    emailVerified: true,
    isAdmin: false,
    ...overrides,
  }
}

function renderGuardedRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAdmin', () => {
  it('renders nothing while the session is restoring', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      isRestoring: true,
    } as ReturnType<typeof useAuth>)

    const { container } = renderGuardedRoute()
    expect(container).toBeEmptyDOMElement()
  })

  it('redirects an unauthenticated visitor to /login', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      isRestoring: false,
    } as ReturnType<typeof useAuth>)

    renderGuardedRoute()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('redirects an authenticated non-admin to /', () => {
    mockUseAuth.mockReturnValue({
      session: baseSession({ isAdmin: false }),
      isRestoring: false,
    } as ReturnType<typeof useAuth>)

    renderGuardedRoute()
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('renders the admin route for an authenticated admin', () => {
    mockUseAuth.mockReturnValue({
      session: baseSession({ isAdmin: true }),
      isRestoring: false,
    } as ReturnType<typeof useAuth>)

    renderGuardedRoute()
    expect(screen.getByText('Admin dashboard')).toBeInTheDocument()
  })
})
