import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TaxonomyPage } from './TaxonomyPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import { taxonomyClient } from '@/features/admin/api/taxonomyClient'
import type { Category } from '@/features/admin/api/taxonomyClient.types'

vi.mock('@/features/admin/api/taxonomyClient', () => ({
  taxonomyClient: {
    listCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    listTags: vi.fn(),
  },
}))

const mockedClient = vi.mocked(taxonomyClient)

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'c1',
    slug: 'marketing',
    name: { en: 'Marketing', vi: 'Tiếp thị' },
    description: { en: '' },
    icon: null,
    color: null,
    parentId: null,
    sortOrder: 1,
    templateCount: 0,
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
      <TaxonomyPage />
    </AuthContext.Provider>,
  )
}

describe('TaxonomyPage', () => {
  beforeEach(() => {
    mockedClient.listCategories.mockReset()
    mockedClient.createCategory.mockReset()
    mockedClient.updateCategory.mockReset()
    mockedClient.listTags.mockReset()
  })

  it('renders a nested category tree', async () => {
    mockedClient.listCategories.mockResolvedValue([
      makeCategory(),
      makeCategory({
        id: 'c2',
        slug: 'social-media',
        name: { en: 'Social Media' },
        parentId: 'c1',
      }),
    ])
    mockedClient.listTags.mockResolvedValue([])
    renderPage()

    await waitFor(() => expect(screen.getByText('Tiếp thị')).toBeInTheDocument())
    expect(screen.getByText('Social Media')).toBeInTheDocument()
  })

  it('creates a root category', async () => {
    mockedClient.listCategories.mockResolvedValue([])
    mockedClient.listTags.mockResolvedValue([])
    mockedClient.createCategory.mockResolvedValue(makeCategory())
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(mockedClient.listCategories).toHaveBeenCalled())
    await user.click(screen.getByRole('button', { name: /danh mục gốc/i }))
    await user.type(screen.getByPlaceholderText('slug'), 'marketing')
    await user.type(screen.getByPlaceholderText('Tên (EN)'), 'Marketing')
    await user.click(screen.getByRole('button', { name: /^tạo$/i }))

    await waitFor(() =>
      expect(mockedClient.createCategory).toHaveBeenCalledWith('admin-token', expect.any(Object)),
    )
  })

  it('re-parents an existing category on edit', async () => {
    mockedClient.listCategories.mockResolvedValue([
      makeCategory(),
      makeCategory({ id: 'c2', slug: 'coding', name: { en: 'Coding' }, parentId: null }),
    ])
    mockedClient.listTags.mockResolvedValue([])
    mockedClient.updateCategory.mockResolvedValue(makeCategory({ id: 'c2', parentId: 'c1' }))
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Coding')).toBeInTheDocument())
    const editButtons = screen.getAllByRole('button', { name: /^sửa$/i })
    await user.click(editButtons[1])
    await user.click(screen.getByRole('button', { name: /^lưu$/i }))

    await waitFor(() =>
      expect(mockedClient.updateCategory).toHaveBeenCalledWith(
        'admin-token',
        'c2',
        expect.any(Object),
      ),
    )
  })

  it('shows the tag management limitation notice', async () => {
    mockedClient.listCategories.mockResolvedValue([])
    mockedClient.listTags.mockResolvedValue([
      { id: 't1', slug: 'email', name: 'email', usageCount: 4 },
    ])
    renderPage()

    await waitFor(() => expect(screen.getByText(/chưa khả dụng/i)).toBeInTheDocument())
    expect(screen.getByText(/email · 4/)).toBeInTheDocument()
  })
})
