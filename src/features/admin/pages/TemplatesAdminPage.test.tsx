import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TemplatesAdminPage } from './TemplatesAdminPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import { templatesAdminClient } from '@/features/admin/api/templatesAdminClient'
import { PublishValidationError } from '@/features/admin/api/templatesAdminClient.types'
import { aiModelsClient } from '@/features/admin/api/aiModelsClient'
import { taxonomyClient } from '@/features/admin/api/taxonomyClient'
import type { Template } from '@/features/admin/api/templatesAdminClient.types'

vi.mock('@/features/admin/api/templatesAdminClient', () => ({
  templatesAdminClient: {
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    list: vi.fn(),
  },
}))
vi.mock('@/features/admin/api/aiModelsClient', () => ({
  aiModelsClient: { listAll: vi.fn(), create: vi.fn(), update: vi.fn() },
}))
vi.mock('@/features/admin/api/taxonomyClient', () => ({
  taxonomyClient: { listCategories: vi.fn(), createCategory: vi.fn(), updateCategory: vi.fn(), listTags: vi.fn() },
}))

const mockedTemplatesClient = vi.mocked(templatesAdminClient)
const mockedAiModelsClient = vi.mocked(aiModelsClient)
const mockedTaxonomyClient = vi.mocked(taxonomyClient)

function makeTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 't1',
    slug: 'my-template',
    title: { en: 'My Template' },
    description: { en: '' },
    coverImage: null,
    isOfficial: false,
    status: 'draft',
    categoryIds: [],
    tagSlugs: [],
    modelCodes: [],
    promptBody: 'Hello {{topic}}',
    systemPrompt: null,
    exampleOutput: null,
    guide: { en: '' },
    variables: [],
    variants: [],
    versionNumber: 1,
    createdAt: '2026-01-01T00:00:00Z',
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
      <TemplatesAdminPage />
    </AuthContext.Provider>,
  )
}

describe('TemplatesAdminPage', () => {
  beforeEach(() => {
    mockedTemplatesClient.create.mockReset()
    mockedTemplatesClient.update.mockReset()
    mockedTemplatesClient.publish.mockReset()
    mockedTemplatesClient.list.mockReset().mockResolvedValue([])
    mockedAiModelsClient.listAll.mockReset().mockResolvedValue([])
    mockedTaxonomyClient.listCategories.mockReset().mockResolvedValue([])
    mockedTaxonomyClient.listTags.mockReset().mockResolvedValue([])
  })

  it('blocks publish and surfaces the missing placeholder', async () => {
    mockedTemplatesClient.create.mockResolvedValue(makeTemplate())
    mockedTemplatesClient.publish.mockRejectedValue(new PublishValidationError(['topic']))
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /tạo template mới/i }))
    await user.type(screen.getByLabelText(/tiêu đề \(en\)/i), 'My Template')
    // fireEvent.change (not user.type) — user-event's type() treats "{" as the
    // start of a special-key sequence, so a literal "{{topic}}" placeholder can't
    // be typed with it without escaping every brace.
    fireEvent.change(screen.getByLabelText(/nội dung prompt/i), { target: { value: 'Hello {{topic}}' } })
    await user.click(screen.getByRole('button', { name: /^publish$/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('topic'))
    expect(mockedTemplatesClient.publish).not.toHaveBeenCalled()
  })

  it('publishes successfully once the placeholder has a matching variable', async () => {
    mockedTemplatesClient.create.mockResolvedValue(makeTemplate())
    mockedTemplatesClient.publish.mockResolvedValue(makeTemplate({ status: 'published', isOfficial: true }))
    mockedTemplatesClient.list.mockResolvedValueOnce([]).mockResolvedValueOnce([
      makeTemplate({ status: 'published', isOfficial: true }),
    ])
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /tạo template mới/i }))
    await user.type(screen.getByLabelText(/tiêu đề \(en\)/i), 'My Template')
    // fireEvent.change (not user.type) — user-event's type() treats "{" as the
    // start of a special-key sequence, so a literal "{{topic}}" placeholder can't
    // be typed with it without escaping every brace.
    fireEvent.change(screen.getByLabelText(/nội dung prompt/i), { target: { value: 'Hello {{topic}}' } })
    await user.click(screen.getByRole('button', { name: /thêm biến/i }))
    await user.type(screen.getByLabelText(/var key 1/i), 'topic')
    await user.click(screen.getByRole('button', { name: /^publish$/i }))

    await waitFor(() => expect(mockedTemplatesClient.publish).toHaveBeenCalledWith('admin-token', 't1'))
    await waitFor(() => expect(screen.getByText(/đã publish/i)).toBeInTheDocument())
  })

  it('creates a new version when editing an already-published template', async () => {
    mockedTemplatesClient.list.mockResolvedValue([makeTemplate({ status: 'published', isOfficial: true })])
    mockedTemplatesClient.update.mockResolvedValue(
      makeTemplate({ status: 'draft', isOfficial: false, versionNumber: 2 }),
    )
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('My Template')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^sửa$/i }))
    await user.click(screen.getByRole('button', { name: /lưu nháp/i }))

    await waitFor(() =>
      expect(mockedTemplatesClient.update).toHaveBeenCalledWith('admin-token', 't1', expect.any(Object)),
    )
  })
})
