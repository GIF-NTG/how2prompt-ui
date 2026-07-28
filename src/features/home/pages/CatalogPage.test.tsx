import { render, screen, waitFor, within } from '@testing-library/react'
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

function renderPage(initialEntries: string[] = ['/']) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
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

  it('re-fetches sorted by newest and resets to page one when the sort control changes', async () => {
    mockedClient.getTemplates.mockResolvedValueOnce({
      data: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      meta: { page: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
    })

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First')

    mockedClient.getTemplates.mockResolvedValueOnce({
      data: [makeTemplate({ id: 't2', slug: 't2', title: { en: 'Newest', vi: 'Newest' } })],
      meta: { page: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
    })

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sắp xếp theo' }), 'newest')

    await screen.findByText('Newest')
    const lastCall = mockedClient.getTemplates.mock.calls.at(-1)?.[0]
    expect(lastCall).toMatchObject({ sort: 'newest', page: 0 })
  })

  it('keeps an active model filter applied after changing the sort order', async () => {
    mockedClient.getModels.mockResolvedValue([
      {
        id: 'm1',
        code: 'claude',
        name: 'Claude',
        provider: 'anthropic',
        model_type: 'text',
        description: null,
        capabilities: {},
        icon_url: null,
        is_active: true,
        sort_order: 1,
      },
    ])
    mockedClient.getTemplates.mockResolvedValue({
      data: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      meta: { page: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
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
      { id: 'c1', slug: 'debugging', name: { en: 'Debugging', vi: 'Debugging' }, description: { en: '', vi: '' }, icon: null, color: null, parent_id: null, sort_order: 1, template_count: 1 },
    ])
    mockedClient.getTags.mockResolvedValue([
      { id: 'tg1', slug: 'chi-tiet', name: 'Chi tiết', usage_count: 1 },
    ])
    mockedClient.getTemplates.mockResolvedValue({
      data: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      meta: { page: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
    })

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First')

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
      { id: 'c1', slug: 'debugging', name: { en: 'Debugging', vi: 'Debugging' }, description: { en: '', vi: '' }, icon: null, color: null, parent_id: null, sort_order: 1, template_count: 1 },
    ])
    mockedClient.getTags.mockResolvedValue([
      { id: 'tg1', slug: 'chi-tiet', name: 'Chi tiết', usage_count: 1 },
    ])
    mockedClient.getTemplates.mockResolvedValue({
      data: [makeTemplate({ id: 't1', slug: 't1', title: { en: 'First', vi: 'First' } })],
      meta: { page: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
    })

    renderPage(['/?category=debugging&tag=chi-tiet'])

    await waitFor(() =>
      expect(mockedClient.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'debugging', tags: 'chi-tiet' }),
      ),
    )
    const categoryButton = await screen.findByRole('button', { name: 'Debugging' })
    const tagButton = screen.getByRole('button', { name: 'Chi tiết' })
    expect(categoryButton).toHaveAttribute('aria-pressed', 'true')
    expect(tagButton).toHaveAttribute('aria-pressed', 'true')
  })
})
