import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { RegisterPage } from './RegisterPage'
import { LoginPage } from './LoginPage'
import { AuthProvider } from '../context/AuthProvider'

function renderRegisterPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('registers successfully and redirects to /login with a confirmation', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByPlaceholderText('tên hiển thị'), 'Nguyễn Văn A')
    await user.type(screen.getByPlaceholderText('ban@vidu.com'), `new-${Date.now()}@example.com`)
    await user.type(screen.getByPlaceholderText('tối thiểu 8 ký tự'), 'matkhau123')
    await user.click(screen.getByRole('button', { name: 'Đăng ký →' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Đã tạo tài khoản thành công')
  })

  it('shows a Vietnamese message when the email is already registered', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByPlaceholderText('tên hiển thị'), 'Người dùng Demo 2')
    await user.type(screen.getByPlaceholderText('ban@vidu.com'), 'demo@how2prompt.dev')
    await user.type(screen.getByPlaceholderText('tối thiểu 8 ký tự'), 'matkhau123')
    await user.click(screen.getByRole('button', { name: 'Đăng ký →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email này đã được đăng ký, hãy đăng nhập',
    )
  })

  it('blocks submission for empty name, malformed email, and short password', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    const nameInput = screen.getByPlaceholderText('tên hiển thị')
    const emailInput = screen.getByPlaceholderText('ban@vidu.com')
    const passwordInput = screen.getByPlaceholderText('tối thiểu 8 ký tự')
    const submit = screen.getByRole('button', { name: 'Đăng ký →' })

    await user.click(submit)
    expect(nameInput).toHaveFocus()

    await user.type(nameInput, 'Ai đó')
    await user.type(emailInput, 'khong-hop-le')
    await user.type(passwordInput, 'matkhau123')
    await user.click(submit)
    expect(emailInput).toHaveFocus()

    await user.clear(emailInput)
    await user.type(emailInput, 'hople@example.com')
    await user.clear(passwordInput)
    await user.type(passwordInput, 'short')
    await user.click(submit)
    expect(passwordInput).toHaveFocus()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
