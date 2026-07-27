import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { EmailVerificationBanner } from './EmailVerificationBanner'
import { AuthProvider } from '../context/AuthProvider'
import { authClient } from '../api/authClient'
import { SESSION_STORAGE_KEY } from '../api/authClient.mock'
import type { Session } from '../api/types'

let accountCounter = 0

// Registers a fresh, uniquely-emailed mock account per test (rather than reusing
// the shared demo account) so each test's resend-cooldown state is isolated —
// mockAccounts is a module-level singleton that persists across tests in this file.
async function seedUnverifiedSession() {
  const email = `verify-test-${accountCounter++}@example.com`
  await authClient.register('Người kiểm thử', email, 'password123')

  const issuedAt = Date.now()
  const session: Session = {
    accountId: email,
    displayName: 'Người kiểm thử',
    email,
    token: 'test-token',
    issuedAt,
    expiresAt: issuedAt + 7 * 24 * 60 * 60 * 1000,
    emailVerified: false,
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function renderBanner() {
  return render(
    <AuthProvider>
      <EmailVerificationBanner />
    </AuthProvider>,
  )
}

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows a reminder with a resend action (Scenario 1)', async () => {
    await seedUnverifiedSession()
    renderBanner()

    expect(await screen.findByRole('button', { name: 'Gửi lại email' })).toBeInTheDocument()
  })

  it('shows a confirmation and disables the action with a 5-minute countdown after resending (Scenario 2)', async () => {
    const user = userEvent.setup()
    await seedUnverifiedSession()
    renderBanner()

    await user.click(await screen.findByRole('button', { name: 'Gửi lại email' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Yêu cầu gửi lại email xác minh đã được tiếp nhận')
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('5:00')
  })

  it('shows a friendly message instead of a raw error when a second device races the cooldown (Scenario 3)', async () => {
    const user = userEvent.setup()
    await seedUnverifiedSession()

    // First tab/device: resend succeeds and starts the cooldown.
    const first = renderBanner()
    await user.click(await within(first.container).findByRole('button', { name: 'Gửi lại email' }))
    await within(first.container).findByRole('status')

    // Second tab/device: a fresh component instance (own countdown state) racing
    // the same backend cooldown for the same account.
    const second = renderBanner()
    await user.click(within(second.container).getByRole('button', { name: 'Gửi lại email' }))

    expect(await within(second.container).findByRole('alert')).toHaveTextContent(
      'vui lòng đợi vài phút rồi thử lại',
    )
  })
})
