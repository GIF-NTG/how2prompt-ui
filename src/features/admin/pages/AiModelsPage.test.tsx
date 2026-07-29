import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AiModelsPage } from './AiModelsPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import { aiModelsClient } from '@/features/admin/api/aiModelsClient'
import type { AiModel } from '@/features/admin/api/aiModelsClient.types'

vi.mock('@/features/admin/api/aiModelsClient', () => ({
  aiModelsClient: {
    listAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}))

const mockedClient = vi.mocked(aiModelsClient)

function makeModel(overrides: Partial<AiModel> = {}): AiModel {
  return {
    id: 'm1',
    code: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelType: 'text',
    description: null,
    capabilities: {},
    iconUrl: null,
    isActive: true,
    sortOrder: 1,
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
      <AiModelsPage />
    </AuthContext.Provider>,
  )
}

describe('AiModelsPage', () => {
  beforeEach(() => {
    mockedClient.listAll.mockReset()
    mockedClient.create.mockReset()
    mockedClient.update.mockReset()
  })

  it('lists existing models and renders no delete action', async () => {
    mockedClient.listAll.mockResolvedValue([makeModel(), makeModel({ id: 'm2', code: 'claude', name: 'Claude' })])
    renderPage()

    await waitFor(() => expect(screen.getByText('GPT-4o')).toBeInTheDocument())
    expect(screen.getByText('Claude')).toBeInTheDocument()
    expect(screen.queryByText(/xóa/i)).not.toBeInTheDocument()
  })

  it('creates a new model', async () => {
    mockedClient.listAll.mockResolvedValueOnce([]).mockResolvedValueOnce([makeModel()])
    mockedClient.create.mockResolvedValue(makeModel())
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(mockedClient.listAll).toHaveBeenCalledTimes(1))
    await user.click(screen.getByRole('button', { name: /tạo model mới/i }))

    await user.type(screen.getByLabelText(/mã model/i), 'gpt-4o')
    await user.type(screen.getByLabelText(/tên hiển thị/i), 'GPT-4o')
    await user.type(screen.getByLabelText(/nhà cung cấp/i), 'openai')
    await user.click(screen.getByRole('button', { name: /tạo model$/i }))

    await waitFor(() => expect(mockedClient.create).toHaveBeenCalledTimes(1))
    expect(mockedClient.create.mock.calls[0][0]).toBe('admin-token')
  })

  it('edits an existing model', async () => {
    mockedClient.listAll.mockResolvedValue([makeModel()])
    mockedClient.update.mockResolvedValue(makeModel({ name: 'GPT-4o Updated' }))
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('GPT-4o')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^sửa$/i }))
    await user.click(screen.getByRole('button', { name: /lưu thay đổi/i }))

    await waitFor(() => expect(mockedClient.update).toHaveBeenCalledWith('admin-token', 'm1', expect.any(Object)))
  })

  it('deactivates a model via the toggle action, without a delete button', async () => {
    mockedClient.listAll.mockResolvedValue([makeModel({ isActive: true })])
    mockedClient.update.mockResolvedValue(makeModel({ isActive: false }))
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('GPT-4o')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /vô hiệu hóa/i }))

    await waitFor(() =>
      expect(mockedClient.update).toHaveBeenCalledWith(
        'admin-token',
        'm1',
        expect.objectContaining({ isActive: false }),
      ),
    )
  })
})
