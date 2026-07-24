import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'
import { authClient } from '../api/authClient'
import { SESSION_STORAGE_KEY } from '../api/authClient.mock'
import type { Session } from '../api/types'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function buildSession(overrides: Partial<Session> = {}): Session {
  const issuedAt = Date.now()
  return {
    accountId: 'test-account',
    displayName: 'Người kiểm thử',
    email: 'test@example.com',
    token: 'test-token',
    issuedAt,
    expiresAt: issuedAt + SEVEN_DAYS_MS,
    ...overrides,
  }
}

function Probe() {
  const { session } = useAuth()
  return <div>{session ? `signed-in:${session.displayName}` : 'signed-out'}</div>
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

describe('AuthProvider / useAuth session restore', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('restores a valid stored session on mount', async () => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(buildSession()))

    renderProbe()

    expect(await screen.findByText('signed-in:Người kiểm thử')).toBeInTheDocument()
  })

  it('clears and ignores an expired stored session on mount', async () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(buildSession({ expiresAt: Date.now() - 1000 })),
    )

    renderProbe()

    expect(await screen.findByText('signed-out')).toBeInTheDocument()
    expect(authClient.restoreSession()).toBeNull()
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })
})
