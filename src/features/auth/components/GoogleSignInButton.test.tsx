import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoogleSignInButton } from './GoogleSignInButton'
import { AuthProvider } from '../context/AuthProvider'
import { authClient } from '../api/authClient'
import { requestGoogleCredential } from '../api/googleIdentity'

vi.mock('../api/googleIdentity', () => ({
  requestGoogleCredential: vi.fn(),
}))

const mockedRequestGoogleCredential = vi.mocked(requestGoogleCredential)

function renderButton() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<GoogleSignInButton />} />
          <Route path="/" element={<div>Trang chủ</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockedRequestGoogleCredential.mockReset()
  })

  it('signs in a visitor and reaches a signed-in state', async () => {
    mockedRequestGoogleCredential.mockResolvedValueOnce({
      email: 'visitor@example.com',
      name: 'Visitor',
      idToken: 'fake-id-token',
    })
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: 'Đăng nhập bằng Google' }))

    await screen.findByText('Trang chủ')
    expect(await authClient.restoreSession()).not.toBeNull()
  })

  it('links a second Google sign-in to the same existing account, not a new one', async () => {
    mockedRequestGoogleCredential.mockResolvedValue({
      email: 'linked@example.com',
      name: 'Linked User',
      idToken: 'fake-id-token',
    })

    const first = await authClient.signInWithGoogle()
    if (first.status !== 'success' || !first.session)
      throw new Error('expected a successful session')

    const second = await authClient.signInWithGoogle()
    if (second.status !== 'success' || !second.session)
      throw new Error('expected a successful session')

    expect(second.accountCreated).toBe(false)
    expect(second.session.accountId).toBe(first.session.accountId)
  })

  it('shows no error banner when the visitor dismisses the Google prompt', async () => {
    mockedRequestGoogleCredential.mockResolvedValueOnce(null)
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: 'Đăng nhập bằng Google' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(await authClient.restoreSession()).toBeNull()
  })
})
