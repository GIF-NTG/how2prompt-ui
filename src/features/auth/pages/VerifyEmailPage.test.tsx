import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { VerifyEmailPage } from './VerifyEmailPage'
import { AuthProvider } from '../context/AuthProvider'

function renderVerifyEmailPage(token: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/verify-email?token=${token}`]}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('marks the account verified for a valid token (Scenario 4), with no active session (Edge Case)', async () => {
    renderVerifyEmailPage('valid-token')

    expect(await screen.findByRole('status')).toHaveTextContent('đã được xác minh thành công')
  })

  it('shows a clear expired-link message for an expired/already-used token (Scenario 5)', async () => {
    renderVerifyEmailPage('expired-token')

    expect(await screen.findByText(/Liên kết đã hết hạn hoặc đã được sử dụng\./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quay lại trang chính' })).toBeInTheDocument()
  })

  it('re-validates the token on every load, so reopening an already-used link via back navigation still shows the expired-link message (Edge Case)', async () => {
    renderVerifyEmailPage('expired-token')

    expect(await screen.findByText(/Liên kết đã hết hạn hoặc đã được sử dụng\./)).toBeInTheDocument()
  })
})
