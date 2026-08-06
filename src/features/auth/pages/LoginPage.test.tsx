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
          <Route path="/" element={<div>Home page</div>} />
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

    await user.type(await screen.findByPlaceholderText('you@example.com'), 'demo@how2prompt.dev')
    await user.type(screen.getByPlaceholderText('••••••••'), 'demo1234')
    await user.click(screen.getByRole('button', { name: 'Log in →' }))

    await waitFor(() => expect(screen.getByText('Home page')).toBeInTheDocument())
    expect(await authClient.restoreSession()).not.toBeNull()
  })

  it('shows an inline error for invalid credentials without clearing input', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = await screen.findByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Log in →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Incorrect email or password',
    )
    expect(emailInput).toHaveValue('wrong@example.com')
    expect(passwordInput).toHaveValue('wrongpass')
  })

  it('blocks submission when the password blank is empty and focuses it', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(await screen.findByPlaceholderText('you@example.com'), 'demo@how2prompt.dev')
    await user.click(screen.getByRole('button', { name: 'Log in →' }))

    const passwordInput = screen.getByPlaceholderText('••••••••')
    expect(passwordInput).toHaveFocus()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(await authClient.restoreSession()).toBeNull()
  })

  it('shows a resend-verification-email action when login fails as unverified', async () => {
    const user = userEvent.setup()
    const email = 'unverified@example.com'
    await authClient.register('Unverified User', email, 'password123')

    renderLoginPage()
    await user.type(await screen.findByPlaceholderText('you@example.com'), email)
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please verify your email before logging in',
    )
    expect(screen.getByRole('button', { name: 'Resend verification email' })).toBeInTheDocument()
  })

  it('resends the verification email using the login form email, then rate-limits a second attempt', async () => {
    const user = userEvent.setup()
    const email = 'unverified2@example.com'
    await authClient.register('Unverified User', email, 'password123')

    renderLoginPage()
    await user.type(await screen.findByPlaceholderText('you@example.com'), email)
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in →' }))

    const resendButton = await screen.findByRole('button', { name: 'Resend verification email' })
    await user.click(resendButton)
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your request to resend the verification email has been received',
    )

    await user.click(screen.getByRole('button', { name: 'Resend verification email' }))
    expect(
      await screen.findByText('You just requested a resend — please wait a few minutes and try again.'),
    ).toBeInTheDocument()
  })

  it('does not show the resend action for a wrong-password failure on a verified account', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(await screen.findByPlaceholderText('you@example.com'), 'demo@how2prompt.dev')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Log in →' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Incorrect email or password',
    )
    expect(
      screen.queryByRole('button', { name: 'Resend verification email' }),
    ).not.toBeInTheDocument()
  })
})
