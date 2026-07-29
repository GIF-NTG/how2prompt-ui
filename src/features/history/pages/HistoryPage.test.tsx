import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { HistoryPage } from './HistoryPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'

const DEMO_SESSION: Session = {
  accountId: 'acc1',
  displayName: 'Demo User',
  email: 'demo@how2prompt.dev',
  token: 'demo-token',
  issuedAt: Date.now(),
  expiresAt: Date.now() + 900_000,
  emailVerified: true,
}

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

function renderHistoryPage(authValue: AuthContextValue, initialEntries = ['/history']) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/login" element={<div>Trang đăng nhập</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('HistoryPage', () => {
  it('redirects a Guest session to /login', async () => {
    renderHistoryPage(makeAuthValue({ session: null }))
    expect(await screen.findByText('Trang đăng nhập')).toBeInTheDocument()
  })

  it('renders nothing while the session is still restoring (no premature redirect)', () => {
    renderHistoryPage(makeAuthValue({ session: null, isRestoring: true }))
    expect(screen.queryByText('Trang đăng nhập')).not.toBeInTheDocument()
    expect(screen.queryByText('Lịch sử prompt đã tạo')).not.toBeInTheDocument()
  })

  it('lists history entries for a logged-in User (mock client)', async () => {
    renderHistoryPage(makeAuthValue({ session: DEMO_SESSION }))
    expect(await screen.findByText('Lịch sử prompt đã tạo')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
    })
  })

  it('shows the empty state copy when there is no history (no active filters)', async () => {
    renderHistoryPage(
      makeAuthValue({ session: DEMO_SESSION }),
      ['/history?templateId=no-such-template'],
    )
    expect(await screen.findByText('Không có kết quả phù hợp với bộ lọc')).toBeInTheDocument()
  })
})
