import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'
import { AuthProvider } from '../context/AuthProvider'
import { authClient } from '../api/authClient'

function renderLoginPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Trang chủ</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('signs in with valid demo credentials and redirects home', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByPlaceholderText('ban@vidu.com'), 'demo@how2prompt.dev')
    await user.type(screen.getByPlaceholderText('••••••••'), 'demo1234')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    await waitFor(() => expect(screen.getByText('Trang chủ')).toBeInTheDocument())
    expect(authClient.restoreSession()).not.toBeNull()
  })

  it('shows an inline error for invalid credentials without clearing input', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByPlaceholderText('ban@vidu.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không chính xác')
    expect(emailInput).toHaveValue('wrong@example.com')
    expect(passwordInput).toHaveValue('wrongpass')
  })

  it('blocks submission when the password blank is empty and focuses it', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByPlaceholderText('ban@vidu.com'), 'demo@how2prompt.dev')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    const passwordInput = screen.getByPlaceholderText('••••••••')
    expect(passwordInput).toHaveFocus()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(authClient.restoreSession()).toBeNull()
  })
})
