import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CopyResultButton } from './CopyResultButton'

describe('CopyResultButton', () => {
  it('copies the given text and shows a confirmation status', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<CopyResultButton text="the final prompt" />)

    await user.click(screen.getByRole('button', { name: /copy/i }))

    expect(writeText).toHaveBeenCalledWith('the final prompt')
    expect(await screen.findByRole('status')).toHaveTextContent(/copied/i)
  })
})
