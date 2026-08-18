import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom'
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
    title: { en: 'Title', vi: 'Title' },
    description: { en: 'Description', vi: 'Description' },
    coverImage: null,
    isOfficial: false,
    isFeatured: false,
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

function TemplateDetailStub() {
  const { id } = useParams<{ id: string }>()
  return <p>Template detail page: {id}</p>
}

function renderPage(initialEntries: string[] = ['/']) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <HomeDataProvider>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/templates/:id" element={<TemplateDetailStub />} />
          </Routes>
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
      screen.getByText('Find the right prompt template — log in to save your history'),
    ).toBeInTheDocument()
  })

  it('renders the featured hero for the first isFeatured template and navigates to it on click', async () => {
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'A', vi: 'A' } })],
      nextCursor: null,
      hasMore: false,
    })
    mockedClient.getFeatured.mockResolvedValue([
      makeTemplate({
        id: 'featured-1',
        slug: 'featured-1',
        title: { en: 'Universal Prompt Framework', vi: 'Universal Prompt Framework' },
      }),
    ])

    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Universal Prompt Framework')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Use now' }))
    expect(screen.getByText('Template detail page: featured-1')).toBeInTheDocument()
  })

  it('renders no featured hero when no template is currently featured', async () => {
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'A', vi: 'A' } })],
      nextCursor: null,
      hasMore: false,
    })

    renderPage()

    await screen.findByText('Find the right prompt template — log in to save your history')
    expect(screen.queryByRole('button', { name: 'Use now' })).not.toBeInTheDocument()
  })

  it('shows "Load more" while more pages remain, and hides it once exhausted', async () => {
    mockedClient.getTemplates.mockResolvedValueOnce({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: 'cursor-1',
      hasMore: true,
    })

    const user = userEvent.setup()
    renderPage()

    const loadMoreButton = await screen.findByRole('button', { name: 'Load more' })

    mockedClient.getTemplates.mockResolvedValueOnce({
      items: [makeTemplate({ id: 't2', slug: 't2', title: { en: 'Second', vi: 'Second' } })],
      nextCursor: null,
      hasMore: false,
    })

    await user.click(loadMoreButton)

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument(),
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

    await user.click(screen.getByRole('button', { name: 'Load more' }))

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
      items: [
        makeTemplate({
          id: 't2',
          slug: 't2',
          title: { en: 'Newest Template', vi: 'Newest Template' },
        }),
      ],
      nextCursor: null,
      hasMore: false,
    })

    await user.click(screen.getByRole('button', { name: 'Sort by' }))
    await user.click(await screen.findByRole('option', { name: 'Newest' }))

    await screen.findByText('Newest Template')
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

    await user.click(screen.getByRole('button', { name: 'Filter by AI model' }))
    await user.click(await screen.findByRole('option', { name: 'Claude' }))
    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({ model: 'claude' }),
    )

    await user.click(screen.getByRole('button', { name: 'Sort by' }))
    await user.click(await screen.findByRole('option', { name: 'Newest' }))

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
      { id: 'tg1', slug: 'chi-tiet', name: 'Detailed', usageCount: 1 },
    ])
    mockedClient.getTemplates.mockResolvedValue({
      items: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      nextCursor: null,
      hasMore: false,
    })

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First')

    await user.click(await screen.findByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('button', { name: 'Debugging' }))
    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({
        category: 'debugging',
        tags: undefined,
      }),
    )
    expect(screen.getByRole('group', { name: 'Filter by category' })).toHaveTextContent('Debugging')

    await user.click(screen.getByRole('button', { name: 'Detailed' }))
    await waitFor(() =>
      expect(mockedClient.getTemplates.mock.calls.at(-1)?.[0]).toMatchObject({
        category: 'debugging',
        tags: 'chi-tiet',
      }),
    )

    // clearing only the Category filter (its own "All") preserves the Tag filter
    const categoryGroup = screen.getByRole('group', { name: 'Filter by category' })
    await user.click(within(categoryGroup).getByRole('button', { name: 'All' }))
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
      { id: 'tg1', slug: 'chi-tiet', name: 'Detailed', usageCount: 1 },
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
    await user.click(await screen.findByRole('button', { name: /Filters/ }))
    const categoryButton = await screen.findByRole('button', { name: 'Debugging' })
    const tagButton = screen.getByRole('button', { name: 'Detailed' })
    expect(categoryButton).toHaveAttribute('aria-pressed', 'true')
    expect(tagButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('"Clear filters" clears both Category and Tag at once', async () => {
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
      { id: 'tg1', slug: 'chi-tiet', name: 'Detailed', usageCount: 1 },
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
    await user.click(await screen.findByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('button', { name: 'Clear filters' }))

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
