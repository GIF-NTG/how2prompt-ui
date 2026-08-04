import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CatalogPage } from './CatalogPage'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { HomeDataProvider } from '@/features/home/context/HomeDataProvider'
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
    coverImage: null,
    isOfficial: false,
    author: { id: null, fullName: null, username: null, avatarUrl: null, type: 'admin' },
    categories: [],
    tags: [],
    supportedModels: [],
    usageCount: 0,
    favoriteCount: 0,
    isFavorited: false,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function renderPage(initialEntries: string[] = ['/']) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <HomeDataProvider>
          <CatalogPage />
        </HomeDataProvider>
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

  it('renders the page heading', async () => {
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'A', vi: 'A' } })],
      nextCursor: null,
      hasMore: false,
    })

    renderPage()
    expect(
      screen.getByText('Tìm mẫu prompt phù hợp — đăng nhập để lưu lịch sử'),
    ).toBeInTheDocument()
  })

  it('shows "Xem thêm" while more pages remain, and hides it once exhausted', async () => {
    mockedClient.getTemplates.mockResolvedValueOnce({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: 'cursor-1',
      hasMore: true,
    })

    const user = userEvent.setup()
    renderPage()

    const loadMoreButton = await screen.findByRole('button', { name: 'Xem thêm' })

    mockedClient.getTemplates.mockResolvedValueOnce({
      items: [makeTemplate({ id: 't2', slug: 't2', title: { en: 'Second', vi: 'Second' } })],
      nextCursor: null,
      hasMore: false,
    })

    await user.click(loadMoreButton)

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Xem thêm' })).not.toBeInTheDocument(),
    )
  })

  it('accumulates templates across "load more" clicks without losing the first page', async () => {
    mockedClient.getTemplates.mockResolvedValueOnce({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: 'cursor-1',
      hasMore: true,
    })

    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('First')).toBeInTheDocument()

    mockedClient.getTemplates.mockResolvedValueOnce({
      items: [makeTemplate({ id: 't2', slug: 't2', title: { en: 'Second', vi: 'Second' } })],
      nextCursor: null,
      hasMore: false,
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
      items: [
        makeTemplate({
          id: 't1',
          slug: 't1',
          title: { en: 'Official template', vi: 'Official template' },
          isOfficial: true,
        }),
        makeTemplate({
          id: 't2',
          slug: 't2',
          title: { en: 'Community template', vi: 'Community template' },
          isOfficial: false,
        }),
      ],
      nextCursor: null,
      hasMore: false,
    })

    renderPage()

    const officialCard = await screen.findByText('Official template')
    const communityCard = screen.getByText('Community template')
    expect(
      officialCard.compareDocumentPosition(communityCard) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('re-fetches sorted by newest and resets pagination when the sort control changes', async () => {
    mockedClient.getTemplates.mockResolvedValueOnce({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First')

    mockedClient.getTemplates.mockResolvedValueOnce({
      items: [makeTemplate({ id: 't2', slug: 't2', title: { en: 'Newest', vi: 'Newest' } })],
      nextCursor: null,
      hasMore: false,
    })

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sắp xếp theo' }), 'newest')

    await screen.findByText('Newest')
    const lastCall = mockedClient.getTemplates.mock.calls.at(-1)?.[0]
    expect(lastCall).toMatchObject({ sort: 'newest' })
    expect(lastCall?.cursor).toBeUndefined()
  })

  it('keeps an active model filter applied after changing the sort order', async () => {
    mockedClient.getModels.mockResolvedValue([
      {
        id: 'm1',
        code: 'claude',
        name: 'Claude',
        provider: 'anthropic',
        modelType: 'text',
        description: null,
        capabilities: {},
        iconUrl: null,
        isActive: true,
        sortOrder: 1,
      },
    ])
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First')

    // ModelFilter's <select> is rendered before the sort <select> and has no
    // accessible name of its own.
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'claude')
    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({ model: 'claude' }),
    )

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sắp xếp theo' }), 'newest')

    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({
        model: 'claude',
        sort: 'newest',
      }),
    )
  })

  it('composes Category and Tag filters with AND logic, updating the URL independently', async () => {
    mockedClient.getCategories.mockResolvedValue([
      {
        id: 'c1',
        slug: 'debugging',
        name: { en: 'Debugging', vi: 'Debugging' },
        description: { en: '', vi: '' },
        icon: null,
        color: null,
        parentId: null,
        sortOrder: 1,
        templateCount: 1,
      },
    ])
    mockedClient.getTags.mockResolvedValue([
      { id: 'tg1', slug: 'chi-tiet', name: 'Chi tiết', usageCount: 1 },
    ])
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First')

    await user.click(await screen.findByRole('button', { name: /Bộ lọc/ }))
    await user.click(await screen.findByRole('button', { name: 'Debugging' }))
    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({
        category: 'debugging',
        tags: undefined,
      }),
    )
    expect(screen.getByRole('group', { name: 'Lọc theo chủ đề' })).toHaveTextContent('Debugging')

    await user.click(screen.getByRole('button', { name: 'Chi tiết' }))
    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({
        category: 'debugging',
        tags: 'chi-tiet',
      }),
    )

    // clearing only the Category filter (its own "Tất cả") preserves the Tag filter
    const categoryGroup = screen.getByRole('group', { name: 'Lọc theo chủ đề' })
    await user.click(within(categoryGroup).getByRole('button', { name: 'Tất cả' }))
    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({
        category: undefined,
        tags: 'chi-tiet',
      }),
    )
  })

  it('pre-selects Category and Tag filters when the catalog is opened with both in the URL', async () => {
    mockedClient.getCategories.mockResolvedValue([
      {
        id: 'c1',
        slug: 'debugging',
        name: { en: 'Debugging', vi: 'Debugging' },
        description: { en: '', vi: '' },
        icon: null,
        color: null,
        parentId: null,
        sortOrder: 1,
        templateCount: 1,
      },
    ])
    mockedClient.getTags.mockResolvedValue([
      { id: 'tg1', slug: 'chi-tiet', name: 'Chi tiết', usageCount: 1 },
    ])
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })

    const user = userEvent.setup()
    renderPage(['/?category=debugging&tag=chi-tiet'])

    await waitFor(() =>
      expect(mockedClient.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'debugging', tags: 'chi-tiet' }),
        undefined,
      ),
    )
    await user.click(await screen.findByRole('button', { name: /Bộ lọc/ }))
    const categoryButton = await screen.findByRole('button', { name: 'Debugging' })
    const tagButton = screen.getByRole('button', { name: 'Chi tiết' })
    expect(categoryButton).toHaveAttribute('aria-pressed', 'true')
    expect(tagButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('"Xóa bộ lọc" clears both Category and Tag at once', async () => {
    mockedClient.getCategories.mockResolvedValue([
      {
        id: 'c1',
        slug: 'debugging',
        name: { en: 'Debugging', vi: 'Debugging' },
        description: { en: '', vi: '' },
        icon: null,
        color: null,
        parentId: null,
        sortOrder: 1,
        templateCount: 1,
      },
    ])
    mockedClient.getTags.mockResolvedValue([
      { id: 'tg1', slug: 'chi-tiet', name: 'Chi tiết', usageCount: 1 },
    ])
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })

    const user = userEvent.setup()
    renderPage(['/?category=debugging&tag=chi-tiet'])

    await waitFor(() =>
      expect(mockedClient.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'debugging', tags: 'chi-tiet' }),
        undefined,
      ),
    )
    await user.click(await screen.findByRole('button', { name: /Bộ lọc/ }))
    await user.click(await screen.findByRole('button', { name: 'Xóa bộ lọc' }))

    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({
        category: undefined,
        tags: undefined,
      }),
    )
  })

  it('does not re-fetch featured/trending/templates when navigating away and back with the same filters', async () => {
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })

    // Simulates RootLayout's Outlet swapping the nested route while
    // HomeDataProvider itself stays mounted across the navigation.
    const { rerender } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <HomeDataProvider>
            <CatalogPage />
          </HomeDataProvider>
        </MemoryRouter>
      </AuthProvider>,
    )
    await screen.findByText('First')
    expect(mockedClient.getFeatured).toHaveBeenCalledTimes(1)
    expect(mockedClient.getTrending).toHaveBeenCalledTimes(1)
    expect(mockedClient.getTemplates).toHaveBeenCalledTimes(1)

    rerender(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <HomeDataProvider>
            <p>Template detail page</p>
          </HomeDataProvider>
        </MemoryRouter>
      </AuthProvider>,
    )
    rerender(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <HomeDataProvider>
            <CatalogPage />
          </HomeDataProvider>
        </MemoryRouter>
      </AuthProvider>,
    )
    await screen.findByText('First')

    expect(mockedClient.getFeatured).toHaveBeenCalledTimes(1)
    expect(mockedClient.getTrending).toHaveBeenCalledTimes(1)
    expect(mockedClient.getTemplates).toHaveBeenCalledTimes(1)
  })
})
