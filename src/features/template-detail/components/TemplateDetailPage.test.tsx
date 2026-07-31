import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { TemplateDetailPage } from './TemplateDetailPage'
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext'
import { vi } from 'vitest'

function makeAuthValue(): AuthContextValue {
  return {
    session: null,
    isRestoring: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    resendVerificationEmail: vi.fn(),
    verifyEmail: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  }
}

function renderAt(path: string) {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/templates/:id" element={<TemplateDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('TemplateDetailPage reload branches (US3)', () => {
  it('pre-fills the form normally when the reload target matches the current version', async () => {
    renderAt('/templates/t1?reload=h1')
    const roleInput = await screen.findByLabelText(/Your Role|Vai trò/i)
    expect((roleInput as HTMLInputElement).value).toBe('Backend Developer')
    // FR-014a (Epic 5 spec.md Clarifications): no "newer version" badge when
    // the reloaded entry already matches the template's current version.
    expect(screen.queryByText(/phiên bản mới hơn/i)).not.toBeInTheDocument()
  })

  it('shows the unavailable banner and blocks the form when the template is deleted', async () => {
    renderAt('/templates/t1?reload=h2')
    expect(await screen.findByRole('alert')).toHaveTextContent(/không còn tồn tại/i)
    expect(screen.queryByLabelText(/Your Role|Vai trò/i)).not.toBeInTheDocument()
  })

  it('shows the newer-version badge when the reload target used an older version', async () => {
    // FR-014a: h3's templateVersionId ('ver-t1-0') is older than the debug
    // template's current version ('ver-t1-1') — NewerVersionBadge must render.
    renderAt('/templates/t1?reload=h3')
    expect(await screen.findByText(/phiên bản mới hơn/i)).toBeInTheDocument()
    const roleInput = await screen.findByLabelText(/Your Role|Vai trò/i)
    expect((roleInput as HTMLInputElement).value).toBe('Frontend Developer')
  })
})
