import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AiModelsPage } from './AiModelsPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import type { Session } from '@/features/auth/api/types'
import { createAiModelsClient } from '../api/aiModelsClient'

vi.mock('../api/aiModelsClient', () => ({
  createAiModelsClient: vi.fn(),
}))

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

function renderPage() {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <AiModelsPage />
    </AuthContext.Provider>,
  )
}

describe('AiModelsPage', () => {
  it('creates a new model and lists it', async () => {
    const user = userEvent.setup()
    const list = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'm1',
          code: 'new-model',
          name: 'New Model',
          provider: 'acme',
          modelType: 'text',
          description: null,
          capabilities: {},
          iconUrl: null,
          isActive: true,
          sortOrder: 0,
        },
      ])
    const create = vi.fn().mockResolvedValue({ id: 'm1' })
    mockedCreateAiModelsClient.mockReturnValue({ list, create, update: vi.fn() })

    renderPage()
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1))

    await user.click(screen.getByRole('button', { name: '+ Thêm model' }))
    const dialog = await screen.findByRole('dialog', { name: 'Thêm model mới' })

    await user.type(within(dialog).getByPlaceholderText('claude-opus-4'), 'new-model')
    await user.type(within(dialog).getByRole('textbox', { name: 'Tên hiển thị' }), 'New Model')
    await user.type(within(dialog).getByPlaceholderText('anthropic'), 'acme')
    await user.click(within(dialog).getByRole('button', { name: 'Tạo model' }))

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('new-model')).toBeInTheDocument()
  })

  it('edits an existing model', async () => {
    const user = userEvent.setup()
    const existing = {
      id: 'm1',
      code: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      modelType: 'text' as const,
      description: null,
      capabilities: {},
      iconUrl: null,
      isActive: true,
      sortOrder: 1,
    }
    const list = vi.fn().mockResolvedValue([existing])
    const update = vi.fn().mockResolvedValue(existing)
    mockedCreateAiModelsClient.mockReturnValue({ list, create: vi.fn(), update })

    renderPage()
    await screen.findByText('GPT-4o')

    await user.click(screen.getByRole('button', { name: 'Sửa' }))
    const dialog = await screen.findByRole('dialog', { name: 'Chỉnh sửa model' })
    const nameInput = within(dialog).getByRole('textbox', { name: 'Tên hiển thị' })
    await user.clear(nameInput)
    await user.type(nameInput, 'GPT-4o Updated')
    await user.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() => expect(update).toHaveBeenCalledWith('m1', expect.objectContaining({ name: 'GPT-4o Updated' })))
  })

  it('deactivates a model without offering a delete action', async () => {
    const user = userEvent.setup()
    const existing = {
      id: 'm1',
      code: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      modelType: 'text' as const,
      description: null,
      capabilities: {},
      iconUrl: null,
      isActive: true,
      sortOrder: 1,
    }
    const list = vi.fn().mockResolvedValue([existing])
    const update = vi.fn().mockResolvedValue({ ...existing, isActive: false })
    mockedCreateAiModelsClient.mockReturnValue({ list, create: vi.fn(), update })

    renderPage()
    const row = (await screen.findByText('GPT-4o')).closest('tr')!
    await user.click(within(row).getByRole('button', { name: 'Tắt' }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('m1', expect.objectContaining({ isActive: false })),
    )
    expect(screen.queryByRole('button', { name: /xóa|delete/i })).not.toBeInTheDocument()
  })
})
