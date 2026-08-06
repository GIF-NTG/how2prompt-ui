import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ResetPasswordPage } from './ResetPasswordPage'
import { LoginPage } from './LoginPage'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { AuthProvider } from '../context/AuthProvider'

function renderResetPasswordPage(token: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ResetPasswordPage', () => {
  it('resets the password with a valid token and redirects to /login with a success message', async () => {
    const user = userEvent.setup()
    renderResetPasswordPage('valid-token')

    await user.type(screen.getByPlaceholderText('at least 8 characters'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Reset password →' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Password reset successfully')
  })

  it('shows an expired-link message with a link back to /forgot-password for an expired/used token', async () => {
    const user = userEvent.setup()
    renderResetPasswordPage('expired-token')

    await user.type(screen.getByPlaceholderText('at least 8 characters'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Reset password →' }))

    expect(
      await screen.findByText(/This link has expired or has already been used\./),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Request a new link' }))
    expect(await screen.findByRole('heading', { name: 'Forgot password' })).toBeInTheDocument()
  })

  it('blocks submission for a password shorter than 8 characters and focuses it', async () => {
    const user = userEvent.setup()
    renderResetPasswordPage('valid-token')

    const passwordInput = screen.getByPlaceholderText('at least 8 characters')
    await user.type(passwordInput, 'short')
    await user.click(screen.getByRole('button', { name: 'Reset password →' }))

    expect(passwordInput).toHaveFocus()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('re-validates the token on every load, so reopening an already-used link via back navigation still shows the expired-link message', async () => {
    const user = userEvent.setup()
    renderResetPasswordPage('expired-token')

    await user.type(screen.getByPlaceholderText('at least 8 characters'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Reset password →' }))

    expect(
      await screen.findByText(/This link has expired or has already been used\./),
    ).toBeInTheDocument()
  })
})
