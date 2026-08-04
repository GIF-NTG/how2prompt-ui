import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DashboardPage } from './DashboardPage'
import { AdminDataProvider } from '../context/AdminDataProvider'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'
import { createDashboardClient } from '../api/dashboardClient'
import { daysAgoIso } from '../utils/dateRange'

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
  dau: 10,
  wau: 40,
  mau: 80,
  promptsGeneratedPerDay: { [daysAgoIso(0)]: 12, [daysAgoIso(1)]: 8 },
  popularTemplates: [
    { templateId: 't1', slug: 'debug', titleI18n: { en: 'Debug' }, usageCount: 50 },
  ],
  mostUsedModels: [{ modelId: 'm1', name: 'gpt-4o', usageCount: 90 }],
  conversionFunnel: { signups: 100, verifiedEmails: 80, promptGenerations: 60 },
}

function renderPage() {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <AdminDataProvider>
        <DashboardPage />
      </AdminDataProvider>
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
    expect(getStats).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: '30 ngày' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('does not re-fetch when the range preset changes, only re-derives the range tile', async () => {
    const user = userEvent.setup()
    const getStats = vi.fn().mockResolvedValue(BASE_STATS)
    mockedCreateDashboardClient.mockReturnValue({ getStats })

    renderPage()
    await screen.findByText('10')
    const initialCallCount = getStats.mock.calls.length

    await user.click(screen.getByRole('button', { name: '7 ngày' }))

    expect(screen.getByRole('button', { name: '7 ngày' })).toHaveAttribute('aria-pressed', 'true')
    expect(getStats.mock.calls.length).toBe(initialCallCount)
  })

  it('applies a custom date range without re-fetching', async () => {
    const user = userEvent.setup()
    const getStats = vi.fn().mockResolvedValue(BASE_STATS)
    mockedCreateDashboardClient.mockReturnValue({ getStats })

    renderPage()
    await screen.findByText('10')

    await user.click(screen.getByRole('button', { name: 'Tuỳ chỉnh' }))
    fireEvent.change(screen.getByLabelText('Từ ngày'), { target: { value: '2026-07-01' } })

    await waitFor(() => expect(screen.getByLabelText('Từ ngày')).toHaveValue('2026-07-01'))
    expect(getStats).toHaveBeenCalledTimes(1)
  })

  it('does not re-fetch when navigating away and back (cached at the AdminDataProvider level)', async () => {
    const getStats = vi.fn().mockResolvedValue(BASE_STATS)
    mockedCreateDashboardClient.mockReturnValue({ getStats })

    const authValue = makeAuthValue()
    const { rerender } = render(
      <AuthContext.Provider value={authValue}>
        <AdminDataProvider>
          <DashboardPage />
        </AdminDataProvider>
      </AuthContext.Provider>,
    )
    await screen.findByText('10')

    // Simulates AdminLayout's Outlet swapping the nested route while
    // AdminDataProvider itself stays mounted across the navigation.
    rerender(
      <AuthContext.Provider value={authValue}>
        <AdminDataProvider>
          <p>Other admin page</p>
        </AdminDataProvider>
      </AuthContext.Provider>,
    )
    rerender(
      <AuthContext.Provider value={authValue}>
        <AdminDataProvider>
          <DashboardPage />
        </AdminDataProvider>
      </AuthContext.Provider>,
    )
    await screen.findByText('10')

    expect(getStats).toHaveBeenCalledTimes(1)
  })
})
