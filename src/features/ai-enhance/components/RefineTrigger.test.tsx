import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RefineTrigger } from './RefineTrigger'

describe('RefineTrigger', () => {
  it('renders nothing when not eligible (guest generation or unverified email)', () => {
    const { container } = render(
      <RefineTrigger eligible={false} state="idle" errorMessage={null} onRefine={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders an enabled button when eligible and idle', () => {
    render(<RefineTrigger eligible state="idle" errorMessage={null} onRefine={vi.fn()} />)
    expect(screen.getByRole('button', { name: /refine with ai/i })).toBeEnabled()
  })

  it('disables the button while loading', () => {
    render(<RefineTrigger eligible state="loading" errorMessage={null} onRefine={vi.fn()} />)
    expect(screen.getByRole('button', { name: /refin/i })).toBeDisabled()
  })

  it('calls onRefine when clicked', async () => {
    const user = userEvent.setup()
    const onRefine = vi.fn()
    render(<RefineTrigger eligible state="idle" errorMessage={null} onRefine={onRefine} />)

    await user.click(screen.getByRole('button', { name: /refine with ai/i }))

    expect(onRefine).toHaveBeenCalledTimes(1)
  })

  it('shows the error message when state is error', () => {
    render(
      <RefineTrigger
        eligible
        state="error"
        errorMessage="Too many requests — please wait a moment and try again."
        onRefine={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/too many requests/i)
  })
})
