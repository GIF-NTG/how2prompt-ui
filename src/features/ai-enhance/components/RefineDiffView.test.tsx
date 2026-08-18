import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RefinementResult } from '../hooks/useRefinePrompt.types'
import { RefineDiffView } from './RefineDiffView'

function makeResult(overrides: Partial<RefinementResult> = {}): RefinementResult {
  return {
    promptId: 'gp1',
    originalPrompt: 'Write a story.',
    refinedPrompt: 'Write a 500-word story about a robot.',
    explanations: ['Added a word count.', 'Gave it a concrete subject.'],
    editedPrompt: null,
    ...overrides,
  }
}

describe('RefineDiffView', () => {
  it('renders the refined prompt and explanations, with no separate Original panel', () => {
    render(<RefineDiffView result={makeResult()} onAccept={vi.fn()} onDiscard={vi.fn()} />)

    expect(screen.getByDisplayValue('Write a 500-word story about a robot.')).toBeInTheDocument()
    expect(screen.getByText('Added a word count.')).toBeInTheDocument()
    expect(screen.getByText('Gave it a concrete subject.')).toBeInTheDocument()
    expect(screen.queryByText('Write a story.')).not.toBeInTheDocument()
  })

  it('calls onAccept with no argument when the refined text is accepted as-is', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    render(<RefineDiffView result={makeResult()} onAccept={onAccept} onDiscard={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /accept/i }))

    expect(onAccept).toHaveBeenCalledWith(undefined)
  })

  it('calls onAccept with the edited text when the user hand-edits the refined text', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    render(<RefineDiffView result={makeResult()} onAccept={onAccept} onDiscard={vi.fn()} />)

    const textarea = screen.getByDisplayValue('Write a 500-word story about a robot.')
    await user.clear(textarea)
    await user.type(textarea, 'My hand-edited version.')
    await user.click(screen.getByRole('button', { name: /accept/i }))

    expect(onAccept).toHaveBeenCalledWith('My hand-edited version.')
  })

  it('calls onDiscard when Reject is clicked', async () => {
    const user = userEvent.setup()
    const onDiscard = vi.fn()
    render(<RefineDiffView result={makeResult()} onAccept={vi.fn()} onDiscard={onDiscard} />)

    await user.click(screen.getByRole('button', { name: /reject/i }))

    expect(onDiscard).toHaveBeenCalledTimes(1)
  })
})
