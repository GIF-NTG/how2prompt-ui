import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { ProfileSettingsPage } from './ProfileSettingsPage'
import { AuthContext, type AuthContextValue } from '../context/AuthContext'
import { AuthProvider } from '../context/AuthProvider'
import { authClient } from '../api/authClient'
import { SESSION_STORAGE_KEY } from '../api/authClient.mock'
import { useAuth } from '../context/useAuth'

const DEMO_EMAIL = 'demo@how2prompt.dev'
const DEMO_PASSWORD = 'demo1234'

function DisplayNameProbe() {
  const { session } = useAuth()
  return <span data-testid="display-name">{session?.displayName}</span>
}

function renderProfilePage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/profile']}>
        <DisplayNameProbe />
        <Routes>
          <Route path="/profile" element={<ProfileSettingsPage />} />
          <Route path="/login" element={<div>Trang đăng nhập</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

/** Stubs an AuthContext value directly — used only for the isRestoring race test,
 *  where we need to control isRestoring/session independently of a real restore. */
function renderProfilePageWithContext(value: AuthContextValue) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfileSettingsPage />} />
          <Route path="/login" element={<div>Trang đăng nhập</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

async function loginAsDemo() {
  const outcome = await authClient.login(DEMO_EMAIL, DEMO_PASSWORD)
  if (outcome.status !== 'success' || !outcome.session)
    throw new Error('expected demo login to succeed')
  return outcome.session
}

/** Waits for the profile fetch to finish and returns the full name field —
 *  the form (including this label) only renders once loading completes, so
 *  `findByLabelText` naturally waits through both the isRestoring gate and
 *  the getProfile() call. Deliberately not asserting the field's current
 *  value here, since earlier tests in this file may have already renamed the
 *  demo account (mock state is shared/mutated across tests, only
 *  localStorage is reset in beforeEach). */
async function findFullNameInputOnceLoaded() {
  return screen.findByLabelText('Tên hiển thị')
}

describe('ProfileSettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('redirects to /login when logged out (Access control)', async () => {
    renderProfilePage()
    await waitFor(() => expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument())
  })

  it('does NOT redirect while isRestoring is still true, even with no session yet (H1 — reload race)', async () => {
    renderProfilePageWithContext({
      session: null,
      isRestoring: true,
      signIn: () => {},
      signOut: async () => {},
      resendVerificationEmail: async () => ({ status: 'success' }),
      verifyEmail: async () => ({ status: 'success' }),
      getProfile: async () => ({
        status: 'success',
        profile: { fullName: '', username: null, bio: null, locale: 'vi' },
      }),
      updateProfile: async () => ({
        status: 'success',
        profile: { fullName: '', username: null, bio: null, locale: 'vi' },
      }),
    })
    expect(screen.queryByText('Trang đăng nhập')).not.toBeInTheDocument()
  })

  it('prefills the form with the current profile (Acceptance 1)', async () => {
    const session = await loginAsDemo()
    const profile = await authClient.getProfile(session.token)
    if (profile.status !== 'success') throw new Error('expected profile fetch to succeed')
    renderProfilePage()

    const fullNameInput = await findFullNameInputOnceLoaded()
    expect(fullNameInput).toHaveValue(profile.profile.fullName)
  })

  it('saves a display-name change and reflects it immediately without reload (Acceptance 2)', async () => {
    const user = userEvent.setup()
    await loginAsDemo()
    renderProfilePage()

    const fullNameInput = await findFullNameInputOnceLoaded()
    await user.clear(fullNameInput)
    await user.type(fullNameInput, 'Tên Mới')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
    expect(screen.getByTestId('display-name')).toHaveTextContent('Tên Mới')
  })

  it('shows an inline duplicate-username error without discarding other unsaved changes (Acceptance 3)', async () => {
    const user = userEvent.setup()

    // Seed a second account that already owns the username we'll try to take.
    // Newly registered mock accounts start unverified, and login now correctly
    // rejects unverified accounts (EMAIL_NOT_VERIFIED) — so this seeds a session
    // directly (same technique as EmailVerificationBanner.test.tsx's
    // seedUnverifiedSession) instead of going through authClient.login, since this
    // test only cares about username-uniqueness validation, not the login/verify flow.
    await authClient.register('Người Khác', 'other@example.com', 'password123')
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        accountId: 'other@example.com',
        displayName: 'Người Khác',
        email: 'other@example.com',
        token: 'seed-token',
        issuedAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        emailVerified: false,
      }),
    )
    const takenUsernameOutcome = await authClient.updateProfile(
      (await authClient.restoreSession())!.token,
      { fullName: 'Người Khác', username: 'taken-name', bio: null, locale: 'vi' },
    )
    expect(takenUsernameOutcome.status).toBe('success')
    await authClient.logout()

    await loginAsDemo()
    renderProfilePage()

    const fullNameInput = await findFullNameInputOnceLoaded()
    await user.clear(fullNameInput)
    await user.type(fullNameInput, 'Tên Chưa Lưu')
    const usernameInput = screen.getByLabelText('Tên người dùng (tuỳ chọn)')
    await user.type(usernameInput, 'taken-name')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() =>
      expect(screen.getByText('Tên người dùng này đã được sử dụng.')).toBeInTheDocument(),
    )
    // The full name change from this same edit must still be shown, not reset.
    expect(screen.getByDisplayValue('Tên Chưa Lưu')).toBeInTheDocument()
  })

  it('blocks submission with an inline error when full name exceeds the length limit (Acceptance 4)', async () => {
    const user = userEvent.setup()
    await loginAsDemo()
    renderProfilePage()

    const fullNameInput = await findFullNameInputOnceLoaded()
    await user.clear(fullNameInput)
    await user.type(fullNameInput, 'a'.repeat(151))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText('Tên hiển thị tối đa 150 ký tự.')).toBeInTheDocument()
    // No success confirmation should appear — the request must never have been sent.
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('allows saving with a blank username (Edge Case)', async () => {
    const user = userEvent.setup()
    await loginAsDemo()
    renderProfilePage()

    await findFullNameInputOnceLoaded()
    expect(screen.getByLabelText('Tên người dùng (tuỳ chọn)')).toHaveValue('')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
  })
})
