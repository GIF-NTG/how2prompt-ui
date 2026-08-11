import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { FavoritesPage } from './FavoritesPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import { createHistoryClient } from '../api/historyClient'
import type { Session } from '@/features/auth/api/types'
import type { TemplateListItem } from '@/features/home/types'

vi.mock('../api/historyClient', () => ({
  createHistoryClient: vi.fn(),
}))

const mockedCreateHistoryClient = vi.mocked(createHistoryClient)

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

function makeTemplate(overrides: Partial<TemplateListItem>): TemplateListItem {
  return {
    id: 'id',
    slug: 'slug',
    title: { en: 'Title', vi: 'Tiêu đề' },
    description: { en: 'Description', vi: 'Mô tả' },
    coverImage: null,
    isOfficial: false,
    isFeatured: false,
    author: { id: null, fullName: null, username: null, avatarUrl: null, type: 'admin' },
    categories: [],
    tags: [],
    supportedModels: [],
    usageCount: 0,
    favoriteCount: 0,
    isFavorited: true,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function renderFavoritesPage(authValue: AuthContextValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/favorites']}>
        <Routes>
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/templates/:id" element={<div>Template detail</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('FavoritesPage', () => {
  it('lists favorited templates', async () => {
    const listFavorites = vi.fn().mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })
    mockedCreateHistoryClient.mockReturnValue({
      list: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      listFavorites,
    })

    renderFavoritesPage(makeAuthValue({ session: DEMO_SESSION }))
    expect(await screen.findByText('First')).toBeInTheDocument()
  })

  it('shows the empty state when there are no favorites', async () => {
    const listFavorites = vi.fn().mockResolvedValue({
      items: [],
      nextCursor: null,
      hasMore: false,
    })
    mockedCreateHistoryClient.mockReturnValue({
      list: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      listFavorites,
    })

    renderFavoritesPage(makeAuthValue({ session: DEMO_SESSION }))
    expect(await screen.findByText('No matching templates found')).toBeInTheDocument()
  })

  it('loads a second page via "Load more" (FR-013 pagination)', async () => {
    const listFavorites = vi
      .fn()
      .mockResolvedValueOnce({
        items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
        nextCursor: '1',
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: [makeTemplate({ id: 't2', slug: 't2', title: { en: 'Second', vi: 'Second' } })],
        nextCursor: null,
        hasMore: false,
      })
    mockedCreateHistoryClient.mockReturnValue({
      list: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      listFavorites,
    })

    const user = userEvent.setup()
    renderFavoritesPage(makeAuthValue({ session: DEMO_SESSION }))

    expect(await screen.findByText('First')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Load more' }))

    await waitFor(() => expect(screen.getByText('Second')).toBeInTheDocument())
    expect(screen.getByText('First')).toBeInTheDocument()
  })

  it('removes a template from the list when unfavorited', async () => {
    const listFavorites = vi.fn().mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })
    mockedCreateHistoryClient.mockReturnValue({
      list: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      listFavorites,
    })

    const user = userEvent.setup()
    renderFavoritesPage(makeAuthValue({ session: DEMO_SESSION }))
    await screen.findByText('First')

    await user.click(screen.getByRole('button', { name: 'Remove from favorites' }))
    await waitFor(() => expect(screen.queryByText('First')).not.toBeInTheDocument())
  })

  it('redirects a Guest session to /login', async () => {
    mockedCreateHistoryClient.mockReturnValue({
      list: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      listFavorites: vi.fn(),
    })
    render(
      <AuthContext.Provider value={makeAuthValue({ session: null })}>
        <MemoryRouter initialEntries={['/favorites']}>
          <Routes>
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )
    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
})
