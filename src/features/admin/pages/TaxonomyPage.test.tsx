import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaxonomyPage } from './TaxonomyPage'
import { AdminDataProvider } from '../context/AdminDataProvider'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'
import { createTaxonomyClient } from '../api/taxonomyClient'
import { createAiModelsClient } from '../api/aiModelsClient'

vi.mock('../api/taxonomyClient', () => ({
  createTaxonomyClient: vi.fn(),
}))
vi.mock('../api/aiModelsClient', () => ({
  createAiModelsClient: vi.fn(),
}))

const mockedCreateTaxonomyClient = vi.mocked(createTaxonomyClient)
const mockedCreateAiModelsClient = vi.mocked(createAiModelsClient)

const ADMIN_SESSION: Session = {
  accountId: 'admin-account',
  displayName: 'Demo Admin',
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
  mockedCreateAiModelsClient.mockReturnValue({
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
  })
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <AdminDataProvider>
        <TaxonomyPage />
      </AdminDataProvider>
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

const SAMPLE_TAG = { id: 't1', slug: 'nhanh', name: 'Quick', usageCount: 5 }

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

    await user.click(screen.getByRole('button', { name: '+ Add category' }))
    await user.type(screen.getByLabelText('Category name'), 'Social Media')
    await user.click(screen.getByRole('button', { name: 'Create category' }))

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

    await user.click(screen.getByRole('button', { name: '+ Add category' }))
    await user.type(screen.getByLabelText('Category name'), 'marketing')
    await user.click(screen.getByRole('button', { name: 'Create category' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/already exists/i)
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

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', { name: 'Confirm' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

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
    expect(await screen.findByText('Quick')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add tag' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Edit' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Delete' }).length).toBeGreaterThan(0)
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
    await screen.findByText('No tags yet.')

    await user.click(screen.getByRole('button', { name: '+ Add tag' }))
    await user.type(screen.getByLabelText('Tag name'), 'Automation')
    await user.click(screen.getByRole('button', { name: 'Create tag' }))

    await waitFor(() =>
      expect(createTag).toHaveBeenCalledWith({ name: 'Automation', slug: 'automation' }),
    )
  })
})
