import { render, screen, waitFor, within } from '@testing-library/react'
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

const SAMPLE_TAG = { id: 't1', slug: 'nhanh', name: 'Nhanh gọn', usageCount: 5 }

describe('TaxonomyPage', () => {
  it('creates a new category via the modal form', async () => {
    const user = userEvent.setup()
    const listCategories = vi.fn().mockResolvedValue([PARENT_CATEGORY])
    const createCategory = vi.fn().mockResolvedValue({ id: 'c2' })
    mockedCreateTaxonomyClient.mockReturnValue({
      listCategories,
      createCategory,
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      listTags: vi.fn().mockResolvedValue([]),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
    })

    renderPage()
    await screen.findByText('Marketing', { selector: 'span' })

    await user.click(screen.getByRole('button', { name: '+ Thêm category' }))
    await user.type(screen.getByLabelText('Tên category'), 'Social Media')
    await user.click(screen.getByRole('button', { name: 'Tạo category' }))

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
      deleteCategory: vi.fn(),
      listTags: vi.fn().mockResolvedValue([]),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
    })

    renderPage()
    await screen.findByText('Marketing', { selector: 'span' })

    await user.click(screen.getByRole('button', { name: '+ Thêm category' }))
    await user.type(screen.getByLabelText('Tên category'), 'marketing')
    await user.click(screen.getByRole('button', { name: 'Tạo category' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/đã tồn tại/i)
    expect(createCategory).not.toHaveBeenCalled()
  })

  it('deletes a category after confirming', async () => {
    const user = userEvent.setup()
    const listCategories = vi.fn().mockResolvedValue([PARENT_CATEGORY])
    const deleteCategory = vi.fn().mockResolvedValue(undefined)
    mockedCreateTaxonomyClient.mockReturnValue({
      listCategories,
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory,
      listTags: vi.fn().mockResolvedValue([]),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
    })

    renderPage()
    await screen.findByText('Marketing', { selector: 'span' })

    await user.click(screen.getByRole('button', { name: 'Xoá' }))
    const dialog = await screen.findByRole('dialog', { name: 'Xác nhận' })
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }))

    await waitFor(() => expect(deleteCategory).toHaveBeenCalledWith('c1'))
  })

  it('lists tags with full CRUD actions available', async () => {
    const listCategories = vi.fn().mockResolvedValue([])
    const listTags = vi.fn().mockResolvedValue([SAMPLE_TAG])
    mockedCreateTaxonomyClient.mockReturnValue({
      listCategories,
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      listTags,
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
    })

    renderPage()
    expect(await screen.findByText('Nhanh gọn')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Thêm tag' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Sửa' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Xoá' }).length).toBeGreaterThan(0)
  })

  it('creates a new tag via the modal form', async () => {
    const user = userEvent.setup()
    const listTags = vi.fn().mockResolvedValue([])
    const createTag = vi.fn().mockResolvedValue({ id: 't2' })
    mockedCreateTaxonomyClient.mockReturnValue({
      listCategories: vi.fn().mockResolvedValue([]),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      listTags,
      createTag,
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
    })

    renderPage()
    await screen.findByText('Chưa có tag nào.')

    await user.click(screen.getByRole('button', { name: '+ Thêm tag' }))
    await user.type(screen.getByLabelText('Tên tag'), 'Automation')
    await user.click(screen.getByRole('button', { name: 'Tạo tag' }))

    await waitFor(() =>
      expect(createTag).toHaveBeenCalledWith({ name: 'Automation', slug: 'automation' }),
    )
  })
})
