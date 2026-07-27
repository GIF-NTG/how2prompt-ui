import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App routing', () => {
  it('redirects the old Google OAuth callback path to /login instead of rendering a dead page', async () => {
    window.history.pushState({}, '', '/auth/google/callback')
    render(<App />)

    await waitFor(() => expect(screen.getByText('Chào bạn quay lại')).toBeInTheDocument())
  })
})
