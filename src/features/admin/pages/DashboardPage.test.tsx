import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DashboardPage } from './DashboardPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'
import { createDashboardClient } from '../api/dashboardClient'

vi.mock('../api/dashboardClient', () => ({ createDashboardClient: vi.fn() }))

const mockedCreateDashboardClient = vi.mocked(createDashboardClient)

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

function makeAuthValue(): AuthContextValue {
  return {
    session: ADMIN_SESSION,
    isRestoring: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    resendVerificationEmail: vi.fn(),
    verifyEmail: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  }
}

const BASE_STATS = {
  totalUsers: 100,
  dau: 10,
  wau: 40,
  mau: 80,
  totalTemplates: 5,
  totalPromptsGenerated: 200,
  promptsToday: 12,
  topTemplates: [{ templateId: 't1', title: { en: 'Debug' }, usageCount: 50 }],
  topModels: [{ modelCode: 'gpt-4o', usageCount: 90 }],
}

function renderPage() {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <DashboardPage />
    </AuthContext.Provider>,
  )
}

describe('DashboardPage', () => {
  it('renders metrics from the dashboard client, defaulting to the 30-day preset', async () => {
    const getStats = vi.fn().mockResolvedValue(BASE_STATS)
    mockedCreateDashboardClient.mockReturnValue({ getStats })

    renderPage()

    expect(await screen.findByText('10')).toBeInTheDocument()
    expect(screen.getByText('Debug')).toBeInTheDocument()
    expect(screen.getByText('gpt-4o')).toBeInTheDocument()
    expect(getStats).toHaveBeenCalledWith(expect.objectContaining({ to: null }))
    expect(screen.getByRole('button', { name: '30 ngày' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('re-fetches metrics when a preset range is changed', async () => {
    const user = userEvent.setup()
    const getStats = vi.fn().mockResolvedValue(BASE_STATS)
    mockedCreateDashboardClient.mockReturnValue({ getStats })

    renderPage()
    await screen.findByText('10')
    const initialCallCount = getStats.mock.calls.length

    await user.click(screen.getByRole('button', { name: '7 ngày' }))

    await waitFor(() => expect(getStats.mock.calls.length).toBeGreaterThan(initialCallCount))
    expect(screen.getByRole('button', { name: '7 ngày' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('re-fetches metrics when a custom date range is applied', async () => {
    const user = userEvent.setup()
    const getStats = vi.fn().mockResolvedValue(BASE_STATS)
    mockedCreateDashboardClient.mockReturnValue({ getStats })

    renderPage()
    await screen.findByText('10')

    await user.click(screen.getByRole('button', { name: 'Tuỳ chỉnh' }))
    await user.type(screen.getByLabelText('Từ ngày'), '2026-07-01')

    await waitFor(() =>
      expect(getStats).toHaveBeenLastCalledWith({ from: '2026-07-01', to: null }),
    )
  })
})
