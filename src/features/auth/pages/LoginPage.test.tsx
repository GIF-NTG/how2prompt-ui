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

    await user.type(await screen.findByPlaceholderText('ban@vidu.com'), 'demo@how2prompt.dev')
    await user.type(screen.getByPlaceholderText('••••••••'), 'demo1234')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    await waitFor(() => expect(screen.getByText('Trang chủ')).toBeInTheDocument())
    expect(await authClient.restoreSession()).not.toBeNull()
  })

  it('shows an inline error for invalid credentials without clearing input', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = await screen.findByPlaceholderText('ban@vidu.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email hoặc mật khẩu không chính xác',
    )
    expect(emailInput).toHaveValue('wrong@example.com')
    expect(passwordInput).toHaveValue('wrongpass')
  })

  it('blocks submission when the password blank is empty and focuses it', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(await screen.findByPlaceholderText('ban@vidu.com'), 'demo@how2prompt.dev')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    const passwordInput = screen.getByPlaceholderText('••••••••')
    expect(passwordInput).toHaveFocus()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(await authClient.restoreSession()).toBeNull()
  })

  it('shows a resend-verification-email action when login fails as unverified', async () => {
    const user = userEvent.setup()
    const email = 'unverified@example.com'
    await authClient.register('Người chưa xác minh', email, 'password123')

    renderLoginPage()
    await user.type(await screen.findByPlaceholderText('ban@vidu.com'), email)
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Vui lòng xác minh email trước khi đăng nhập',
    )
    expect(screen.getByRole('button', { name: 'Gửi lại email xác minh' })).toBeInTheDocument()
  })

  it('resends the verification email using the login form email, then rate-limits a second attempt', async () => {
    const user = userEvent.setup()
    const email = 'unverified2@example.com'
    await authClient.register('Người chưa xác minh', email, 'password123')

    renderLoginPage()
    await user.type(await screen.findByPlaceholderText('ban@vidu.com'), email)
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    const resendButton = await screen.findByRole('button', { name: 'Gửi lại email xác minh' })
    await user.click(resendButton)
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Yêu cầu gửi lại email xác minh đã được tiếp nhận',
    )

    await user.click(screen.getByRole('button', { name: 'Gửi lại email xác minh' }))
    expect(
      await screen.findByText('Bạn vừa yêu cầu gửi lại, vui lòng đợi vài phút rồi thử lại.'),
    ).toBeInTheDocument()
  })

  it('does not show the resend action for a wrong-password failure on a verified account', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(await screen.findByPlaceholderText('ban@vidu.com'), 'demo@how2prompt.dev')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email hoặc mật khẩu không chính xác',
    )
    expect(screen.queryByRole('button', { name: 'Gửi lại email xác minh' })).not.toBeInTheDocument()
  })
})
