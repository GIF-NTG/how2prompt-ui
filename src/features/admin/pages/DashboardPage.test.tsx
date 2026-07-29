import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DashboardPage } from './DashboardPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import { dashboardClient } from '@/features/admin/api/dashboardClient'
import type { DashboardMetricSnapshot } from '@/features/admin/api/dashboardClient.types'

vi.mock('@/features/admin/api/dashboardClient', () => ({
  dashboardClient: { getStats: vi.fn() },
}))

const mockedClient = vi.mocked(dashboardClient)

function makeStats(overrides: Partial<DashboardMetricSnapshot> = {}): DashboardMetricSnapshot {
  return {
    totalUsers: 100,
    dau: 10,
    wau: 40,
    mau: 80,
    totalTemplates: 5,
    totalPromptsGenerated: 200,
    promptsToday: 12,
    topTemplates: [{ templateId: 't1', title: { en: 'Template A' }, usageCount: 50 }],
    topModels: [{ modelCode: 'gpt-4o', usageCount: 90 }],
    ...overrides,
  }
}

const adminAuthValue = {
  session: {
    accountId: 'admin-1',
    displayName: 'Admin',
    email: 'admin@how2prompt.dev',
    token: 'admin-token',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60_000,
    emailVerified: true,
    isAdmin: true,
  },
  isRestoring: false,
} as AuthContextValue

function renderPage() {
  return render(
    <AuthContext.Provider value={adminAuthValue}>
      <DashboardPage />
    </AuthContext.Provider>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockedClient.getStats.mockReset()
  })

  it('renders the fetched metrics', async () => {
    mockedClient.getStats.mockResolvedValue(makeStats())
    renderPage()

    await waitFor(() => expect(screen.getByText('Template A')).toBeInTheDocument())
    expect(screen.getByText('gpt-4o')).toBeInTheDocument()
  })

  it('refetches with the selected date range', async () => {
    mockedClient.getStats.mockResolvedValue(makeStats())
    renderPage()

    await waitFor(() => expect(mockedClient.getStats).toHaveBeenCalledTimes(1))

    // fireEvent.change sets the whole value in one go — a native date input isn't
    // meant to be typed character-by-character, and doing so with user.type()
    // fires (and reloads on) every partial intermediate value. Each of the two
    // fields is still its own onChange/reload, so 1 (initial) + 2 (from, to) = 3.
    const [fromInput, toInput] = screen.getAllByLabelText(/từ|đến/i)
    fireEvent.change(fromInput, { target: { value: '2026-01-01' } })
    fireEvent.change(toInput, { target: { value: '2026-01-31' } })

    await waitFor(() => expect(mockedClient.getStats).toHaveBeenCalledTimes(3))
    expect(mockedClient.getStats).toHaveBeenLastCalledWith('admin-token', {
      from: '2026-01-01',
      to: '2026-01-31',
    })
  })
})
