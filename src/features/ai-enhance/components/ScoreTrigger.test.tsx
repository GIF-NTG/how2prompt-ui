import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ScoreTrigger } from './ScoreTrigger'

describe('ScoreTrigger', () => {
  it('renders nothing when generatedPromptId is null', () => {
    const { container } = render(
      <ScoreTrigger generatedPromptId={null} state="idle" errorMessage={null} onScore={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders an enabled button when idle and has a generatedPromptId', () => {
    render(
      <ScoreTrigger generatedPromptId="gp1" state="idle" errorMessage={null} onScore={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /score/i })).toBeEnabled()
  })

  it('disables the button while loading', () => {
    render(
      <ScoreTrigger
        generatedPromptId="gp1"
        state="loading"
        errorMessage={null}
        onScore={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /scor/i })).toBeDisabled()
  })

  it('calls onScore when clicked', async () => {
    const user = userEvent.setup()
    const onScore = vi.fn()
    render(
      <ScoreTrigger generatedPromptId="gp1" state="idle" errorMessage={null} onScore={onScore} />,
    )

    await user.click(screen.getByRole('button', { name: /score/i }))

    expect(onScore).toHaveBeenCalledTimes(1)
  })

  it('shows the error message when state is error', () => {
    render(
      <ScoreTrigger
        generatedPromptId="gp1"
        state="error"
        errorMessage="Too many requests — please wait a moment and try again."
        onScore={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/too many requests/i)
  })

  it('renders enabled button in result state (allows re-scoring)', () => {
    render(
      <ScoreTrigger generatedPromptId="gp1" state="result" errorMessage={null} onScore={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /score/i })).toBeEnabled()
  })
})
