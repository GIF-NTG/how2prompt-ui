import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaxonomyPage } from './TaxonomyPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'
import { createTaxonomyClient } from '../api/taxonomyClient'

vi.mock('../api/taxonomyClient', () => ({
  createTaxonomyClient: vi.fn(),
}))

const mockedCreateTaxonomyClient = vi.mocked(createTaxonomyClient)

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

function renderPage() {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <TaxonomyPage />
    </AuthContext.Provider>,
  )
}

const PARENT_CATEGORY = {
  id: 'c1',
  slug: 'marketing',
  name: { en: 'Marketing' },
  description: { en: '' },
  icon: null,
  color: null,
  parentId: null,
  sortOrder: 0,
  templateCount: 0,
}

describe('TaxonomyPage', () => {
  it('creates a new category and re-parents an existing one', async () => {
    const user = userEvent.setup()
    const listCategories = vi.fn().mockResolvedValue([PARENT_CATEGORY])
    const createCategory = vi.fn().mockResolvedValue({ id: 'c2' })
    const updateCategory = vi.fn().mockResolvedValue(PARENT_CATEGORY)
    const listTags = vi.fn().mockResolvedValue([])
    mockedCreateTaxonomyClient.mockReturnValue({
      listCategories,
      createCategory,
      updateCategory,
      listTags,
    })

    renderPage()
    await screen.findByText('Marketing', { selector: 'span' })

    await user.type(screen.getByPlaceholderText('Tên category mới'), 'Social Media')
    await user.click(screen.getByRole('button', { name: 'Thêm category' }))

    await waitFor(() =>
      expect(createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: { en: 'Social Media' }, parentId: null }),
      ),
    )
  })

  it('rejects a duplicate sibling category name client-side without calling the API', async () => {
    const user = userEvent.setup()
    const listCategories = vi.fn().mockResolvedValue([PARENT_CATEGORY])
    const createCategory = vi.fn()
    mockedCreateTaxonomyClient.mockReturnValue({
      listCategories,
      createCategory,
      updateCategory: vi.fn(),
      listTags: vi.fn().mockResolvedValue([]),
    })

    renderPage()
    await screen.findByText('Marketing', { selector: 'span' })

    await user.type(screen.getByPlaceholderText('Tên category mới'), 'marketing')
    await user.click(screen.getByRole('button', { name: 'Thêm category' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/đã tồn tại/i)
    expect(createCategory).not.toHaveBeenCalled()
  })

  it('shows the tag management notice with read-only tags', async () => {
    const listCategories = vi.fn().mockResolvedValue([])
    const listTags = vi
      .fn()
      .mockResolvedValue([{ id: 't1', slug: 'nhanh', name: 'Nhanh gọn', usageCount: 5 }])
    mockedCreateTaxonomyClient.mockReturnValue({
      listCategories,
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      listTags,
    })

    renderPage()
    expect(await screen.findByText(/chưa khả dụng/i)).toBeInTheDocument()
    expect(await screen.findByText(/Nhanh gọn/)).toBeInTheDocument()
  })
})
