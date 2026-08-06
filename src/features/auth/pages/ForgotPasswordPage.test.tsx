import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { AuthProvider } from '../context/AuthProvider'

function renderForgotPasswordPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ForgotPasswordPage', () => {
  it('shows a confirmation message for an email with an existing account', async () => {
    const user = userEvent.setup()
    renderForgotPasswordPage()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'demo@how2prompt.dev')
    await user.click(screen.getByRole('button', { name: 'Send link →' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'If this email exists in our system, a password reset link has been sent to it.',
    )
  })

  it('shows the identical confirmation message for an email with no matching account', async () => {
    const user = userEvent.setup()
    renderForgotPasswordPage()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'nobody@example.com')
    await user.click(screen.getByRole('button', { name: 'Send link →' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'If this email exists in our system, a password reset link has been sent to it.',
    )
  })

  it('blocks submission for an empty or malformed email and focuses it', async () => {
    const user = userEvent.setup()
    renderForgotPasswordPage()

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const submit = screen.getByRole('button', { name: 'Send link →' })

    await user.click(submit)
    expect(emailInput).toHaveFocus()

    await user.type(emailInput, 'not-a-valid-email')
    await user.click(submit)
    expect(emailInput).toHaveFocus()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
