import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TemplatesAdminPage } from './TemplatesAdminPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'
import { createTemplatesAdminClient } from '../api/templatesAdminClient'
import { createTaxonomyClient } from '../api/taxonomyClient'
import { createAiModelsClient } from '../api/aiModelsClient'

vi.mock('../api/templatesAdminClient', () => ({ createTemplatesAdminClient: vi.fn() }))
vi.mock('../api/taxonomyClient', () => ({ createTaxonomyClient: vi.fn() }))
vi.mock('../api/aiModelsClient', () => ({ createAiModelsClient: vi.fn() }))

const mockedCreateTemplatesAdminClient = vi.mocked(createTemplatesAdminClient)
const mockedCreateTaxonomyClient = vi.mocked(createTaxonomyClient)
const mockedCreateAiModelsClient = vi.mocked(createAiModelsClient)

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

function setupCommonMocks() {
  mockedCreateTaxonomyClient.mockReturnValue({
    listCategories: vi.fn().mockResolvedValue([]),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    listTags: vi
      .fn()
      .mockResolvedValue([{ id: 't1', slug: 'nhanh', name: 'Nhanh gọn', usageCount: 5 }]),
  })
  mockedCreateAiModelsClient.mockReturnValue({
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
  })
}

function renderPage() {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <TemplatesAdminPage />
    </AuthContext.Provider>,
  )
}

describe('TemplatesAdminPage', () => {
  it('blocks publish client-side when a placeholder has no matching variable', async () => {
    const user = userEvent.setup()
    setupCommonMocks()
    const create = vi.fn()
    const publish = vi.fn()
    mockedCreateTemplatesAdminClient.mockReturnValue({
      list: vi.fn().mockResolvedValue([]),
      create,
      update: vi.fn(),
      publish,
    })

    renderPage()
    await screen.findByText('Tạo template mới')

    await user.type(screen.getByRole('textbox', { name: 'Tiêu đề (EN)' }), 'My Template')
    // user-event's `type()` treats a single `{` as the start of a special-key
    // sequence — doubling it (`{{`) types a literal brace; `}` needs no escaping.
    await user.type(
      screen.getByRole('textbox', { name: /Prompt body/ }),
      'Hello {{{{name}}',
    )
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/name/)
    expect(publish).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it('publishes once the placeholder has a matching declared variable', async () => {
    const user = userEvent.setup()
    setupCommonMocks()
    const created = {
      id: 'tpl1',
      title: { en: 'My Template' },
      description: { en: '' },
      coverImage: null,
      categoryIds: [],
      tagSlugs: [],
      modelCodes: [],
      isOfficial: false,
      status: 'draft' as const,
      currentVersion: {
        id: 'tpl1-v1',
        versionNumber: 1,
        promptBody: 'Hello {{name}}',
        systemPrompt: null,
        exampleOutput: null,
        guide: { en: '' },
        variables: [],
        variants: [],
      },
    }
    const create = vi.fn().mockResolvedValue(created)
    const publish = vi.fn().mockResolvedValue({ ...created, status: 'published', isOfficial: true })
    const list = vi.fn().mockResolvedValue([])
    mockedCreateTemplatesAdminClient.mockReturnValue({
      list,
      create,
      update: vi.fn(),
      publish,
    })

    renderPage()
    await screen.findByText('Tạo template mới')

    await user.type(screen.getByRole('textbox', { name: 'Tiêu đề (EN)' }), 'My Template')
    await user.type(screen.getByRole('textbox', { name: /Prompt body/ }), 'Hello {{{{name}}')
    await user.click(screen.getByRole('button', { name: '+ Thêm variable' }))
    await user.type(screen.getByPlaceholderText('varKey'), 'name')

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(publish).toHaveBeenCalledWith('tpl1'))
  })

  it('editing an already-published template creates a new version', async () => {
    setupCommonMocks()
    const published = {
      id: 'tpl1',
      title: { en: 'Published Template' },
      description: { en: '' },
      coverImage: null,
      categoryIds: [],
      tagSlugs: [],
      modelCodes: [],
      isOfficial: true,
      status: 'published' as const,
      currentVersion: {
        id: 'tpl1-v1',
        versionNumber: 1,
        promptBody: 'Hello world',
        systemPrompt: null,
        exampleOutput: null,
        guide: { en: '' },
        variables: [],
        variants: [],
      },
    }
    const list = vi.fn().mockResolvedValue([published])
    const update = vi.fn().mockResolvedValue({
      ...published,
      currentVersion: { ...published.currentVersion, id: 'tpl1-v2', versionNumber: 2 },
    })
    mockedCreateTemplatesAdminClient.mockReturnValue({ list, create: vi.fn(), update, publish: vi.fn() })

    const user = userEvent.setup()
    renderPage()
    await screen.findByText(/Published Template/)

    await user.click(screen.getByRole('button', { name: 'Sửa' }))
    await user.click(screen.getByRole('button', { name: 'Lưu Draft' }))

    await waitFor(() => expect(update).toHaveBeenCalledWith('tpl1', expect.any(Object)))
  })

  it('offers no create-new-tag affordance in the tag picker', async () => {
    setupCommonMocks()
    mockedCreateTemplatesAdminClient.mockReturnValue({
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      publish: vi.fn(),
    })

    renderPage()
    await screen.findByText('Tạo template mới')

    expect(await screen.findByText('Nhanh gọn')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /thêm tag|new tag|create tag/i })).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/tag mới/i)).not.toBeInTheDocument()
  })
})
