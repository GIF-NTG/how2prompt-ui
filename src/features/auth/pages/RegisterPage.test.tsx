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

    await user.type(await screen.findByPlaceholderText('display name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('you@example.com'), `new-${Date.now()}@example.com`)
    await user.type(screen.getByPlaceholderText('at least 8 characters'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up →' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Account created successfully')
  })

  it('shows a message when the email is already registered', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(await screen.findByPlaceholderText('display name'), 'Demo User 2')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'demo@how2prompt.dev')
    await user.type(screen.getByPlaceholderText('at least 8 characters'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This email is already registered, please log in',
    )
  })

  it('blocks submission for empty name, malformed email, and short password', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    const nameInput = await screen.findByPlaceholderText('display name')
    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText('at least 8 characters')
    const submit = screen.getByRole('button', { name: 'Sign up →' })

    await user.click(submit)
    expect(nameInput).toHaveFocus()

    await user.type(nameInput, 'Someone')
    await user.type(emailInput, 'not-a-valid-email')
    await user.type(passwordInput, 'password123')
    await user.click(submit)
    expect(emailInput).toHaveFocus()

    await user.clear(emailInput)
    await user.type(emailInput, 'valid@example.com')
    await user.clear(passwordInput)
    await user.type(passwordInput, 'short')
    await user.click(submit)
    expect(passwordInput).toHaveFocus()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
