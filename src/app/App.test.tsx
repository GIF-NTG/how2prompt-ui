import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App routing', () => {
  it(
    'redirects the old Google OAuth callback path to /login instead of rendering a dead page',
    async () => {
      window.history.pushState({}, '', '/auth/google/callback')
      render(<App />)

      // Lazily-loaded pages (see `App.tsx`) add a dynamic-import chunk fetch
      // on top of the redirect + render, which can exceed Vitest's default
      // 5s test timeout under a loaded test run — bump both.
      await waitFor(() => expect(screen.getByText('Chào bạn quay lại')).toBeInTheDocument(), {
        timeout: 10000,
      })
    },
    10000,
  )
})
