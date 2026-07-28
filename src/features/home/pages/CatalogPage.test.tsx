import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CatalogPage } from './CatalogPage'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { templateClient } from '@/features/home/api/templateClient'
import type { TemplateListItem } from '@/features/home/types'

vi.mock('@/features/home/api/templateClient', () => ({
  templateClient: {
    getFeatured: vi.fn(),
    getTrending: vi.fn(),
    getTemplates: vi.fn(),
    getModels: vi.fn(),
    getCategories: vi.fn(),
    getTags: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}))

const mockedClient = vi.mocked(templateClient)

function makeTemplate(overrides: Partial<TemplateListItem>): TemplateListItem {
  return {
    id: 'id',
    slug: 'slug',
    title: { en: 'Title', vi: 'Tiêu đề' },
    description: { en: 'Description', vi: 'Mô tả' },
    cover_image: null,
    is_official: false,
    author: { id: null, full_name: null, username: null, avatar_url: null, type: 'admin' },
    categories: [],
    tags: [],
    supported_models: [],
    usage_count: 0,
    favorite_count: 0,
    is_favorited: false,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('CatalogPage', () => {
  beforeEach(() => {
    mockedClient.getFeatured.mockReset().mockResolvedValue([])
    mockedClient.getTrending.mockReset().mockResolvedValue([])
    mockedClient.getTemplates.mockReset()
    mockedClient.getModels.mockReset().mockResolvedValue([])
    mockedClient.getCategories.mockReset().mockResolvedValue([])
    mockedClient.getTags.mockReset().mockResolvedValue([])
  })

  it('renders the page heading and eyebrow', async () => {
    mockedClient.getTemplates.mockResolvedValue({
      data: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'A', vi: 'A' } })],
      meta: { page: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
    })

    renderPage()
    expect(screen.getByText('templates · guest & member')).toBeInTheDocument()
    expect(
      screen.getByText('Tìm mẫu prompt phù hợp — đăng nhập để lưu lịch sử'),
    ).toBeInTheDocument()
  })

  it('shows "Xem thêm" while more pages remain, and hides it once exhausted', async () => {
    mockedClient.getTemplates.mockResolvedValueOnce({
      data: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      meta: { page: 0, size: 1, totalElements: 2, totalPages: 2, hasNext: true, hasPrevious: false },
    })

    const user = userEvent.setup()
    renderPage()

    const loadMoreButton = await screen.findByRole('button', { name: 'Xem thêm' })

    mockedClient.getTemplates.mockResolvedValueOnce({
      data: [makeTemplate({ id: 't2', slug: 't2', title: { en: 'Second', vi: 'Second' } })],
      meta: { page: 1, size: 1, totalElements: 2, totalPages: 2, hasNext: false, hasPrevious: true },
    })

    await user.click(loadMoreButton)

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Xem thêm' })).not.toBeInTheDocument(),
    )
  })

  it('accumulates templates across "load more" clicks without losing the first page', async () => {
    mockedClient.getTemplates.mockResolvedValueOnce({
      data: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      meta: { page: 0, size: 1, totalElements: 2, totalPages: 2, hasNext: true, hasPrevious: false },
    })

    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('First')).toBeInTheDocument()

    mockedClient.getTemplates.mockResolvedValueOnce({
      data: [makeTemplate({ id: 't2', slug: 't2', title: { en: 'Second', vi: 'Second' } })],
      meta: { page: 1, size: 1, totalElements: 2, totalPages: 2, hasNext: false, hasPrevious: true },
    })

    await user.click(screen.getByRole('button', { name: 'Xem thêm' }))

    await waitFor(() => expect(screen.getByText('Second')).toBeInTheDocument())
    expect(screen.getByText('First')).toBeInTheDocument()
  })

  it('preserves the official-first order returned by the template client', async () => {
    // The client (see templateClient.mock.test.ts) is responsible for putting
    // official templates first; this guards against the catalog UI silently
    // re-ordering or dropping that order on render.
    mockedClient.getTemplates.mockResolvedValue({
      data: [
        makeTemplate({
          id: 't1',
          slug: 't1',
          title: { en: 'Official template', vi: 'Official template' },
          is_official: true,
        }),
        makeTemplate({
          id: 't2',
          slug: 't2',
          title: { en: 'Community template', vi: 'Community template' },
          is_official: false,
        }),
      ],
      meta: { page: 0, size: 20, totalElements: 2, totalPages: 1, hasNext: false, hasPrevious: false },
    })

    renderPage()

    const officialCard = await screen.findByText('Official template')
    const communityCard = screen.getByText('Community template')
    expect(
      officialCard.compareDocumentPosition(communityCard) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
