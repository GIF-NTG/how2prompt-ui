import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { HistoryPage } from './HistoryPage'
import { HistoryDataProvider } from '../context/HistoryDataProvider'
import { HomeDataProvider } from '@/features/home/context/HomeDataProvider'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'
import { createHistoryClient } from '../api/historyClient'
import { createMockHistoryClient } from '../api/historyClient.mock'

vi.mock('../api/historyClient', () => ({ createHistoryClient: vi.fn() }))

const mockedCreateHistoryClient = vi.mocked(createHistoryClient)

/** Real mock-store behavior (list/get/remove all work against the same
 *  in-memory `historyClient.mock.ts` store the app uses without a backend),
 *  wrapped with a `list` spy so tests can assert on call counts. */
function useRealishHistoryClient() {
  const client = createMockHistoryClient()
  const listSpy = vi.spyOn(client, 'list')
  mockedCreateHistoryClient.mockReturnValue(client)
  return { client, listSpy }
}

const DEMO_SESSION: Session = {
  accountId: 'acc1',
  displayName: 'Demo User',
  email: 'demo@how2prompt.dev',
  token: 'demo-token',
  issuedAt: Date.now(),
  expiresAt: Date.now() + 900_000,
  emailVerified: true,
  isAdmin: false,
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
      <HomeDataProvider>
        <HistoryDataProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <Routes>
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/login" element={<div>Login page</div>} />
            </Routes>
          </MemoryRouter>
        </HistoryDataProvider>
      </HomeDataProvider>
    </AuthContext.Provider>,
  )
}

describe('HistoryPage', () => {
  it('redirects a Guest session to /login', async () => {
    useRealishHistoryClient()
    renderHistoryPage(makeAuthValue({ session: null }))
    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })

  it('renders nothing while the session is still restoring (no premature redirect)', () => {
    useRealishHistoryClient()
    renderHistoryPage(makeAuthValue({ session: null, isRestoring: true }))
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
    expect(screen.queryByText('Generated Prompt History')).not.toBeInTheDocument()
  })

  it('lists history entries for a logged-in User (mock client)', async () => {
    useRealishHistoryClient()
    renderHistoryPage(makeAuthValue({ session: DEMO_SESSION }))
    expect(await screen.findByText('Generated Prompt History')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
    })
  })

  it('shows the empty state copy when there is no history (no active filters)', async () => {
    useRealishHistoryClient()
    renderHistoryPage(makeAuthValue({ session: DEMO_SESSION }), [
      '/history?templateId=no-such-template',
    ])
    expect(await screen.findByText('No results match your filters')).toBeInTheDocument()
  })

  it('does not re-fetch when navigating away and back with the same filters', async () => {
    const { listSpy } = useRealishHistoryClient()
    const authValue = makeAuthValue({ session: DEMO_SESSION })

    const { rerender } = render(
      <AuthContext.Provider value={authValue}>
        <HomeDataProvider>
          <HistoryDataProvider>
            <MemoryRouter initialEntries={['/history']}>
              <Routes>
                <Route path="/history" element={<HistoryPage />} />
              </Routes>
            </MemoryRouter>
          </HistoryDataProvider>
        </HomeDataProvider>
      </AuthContext.Provider>,
    )
    await screen.findByText('Generated Prompt History')
    await waitFor(() => expect(screen.getAllByRole('article').length).toBeGreaterThan(0))
    expect(listSpy).toHaveBeenCalledTimes(1)

    // Simulates RootLayout's Outlet swapping the nested route while
    // HistoryDataProvider itself stays mounted across the navigation.
    rerender(
      <AuthContext.Provider value={authValue}>
        <HomeDataProvider>
          <HistoryDataProvider>
            <p>Elsewhere</p>
          </HistoryDataProvider>
        </HomeDataProvider>
      </AuthContext.Provider>,
    )
    rerender(
      <AuthContext.Provider value={authValue}>
        <HomeDataProvider>
          <HistoryDataProvider>
            <MemoryRouter initialEntries={['/history']}>
              <Routes>
                <Route path="/history" element={<HistoryPage />} />
              </Routes>
            </MemoryRouter>
          </HistoryDataProvider>
        </HomeDataProvider>
      </AuthContext.Provider>,
    )
    await screen.findByText('Generated Prompt History')
    await waitFor(() => expect(screen.getAllByRole('article').length).toBeGreaterThan(0))

    expect(listSpy).toHaveBeenCalledTimes(1)
  })
})
