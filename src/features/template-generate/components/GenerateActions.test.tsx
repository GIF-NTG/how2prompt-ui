import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GenerateActions } from './GenerateActions'
import { ApiError } from '@/shared/utils/httpClient'
import { createMockGenerateClient } from '../api/generateClient.mock'
import type { GenerateResponse } from '../api/generateClient.types'

function makeResponse(overrides: Partial<GenerateResponse> = {}): GenerateResponse {
  return {
    generatedPromptId: null,
    finalPrompt: 'the final prompt',
    tokensEstimate: 10,
    aiModelCode: 'gpt-4',
    remainingQuota: 2,
    ...overrides,
  }
}

describe('GenerateActions', () => {
  it('shows the final prompt copy affordance and a working Copy button after success', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    const onGenerate = vi.fn().mockResolvedValue(makeResponse())
    const { rerender } = render(
      <GenerateActions isValid onGenerate={onGenerate} finalPrompt={null} />,
    )

    await user.click(screen.getByRole('button', { name: /generate prompt/i }))
    await waitFor(() => expect(onGenerate).toHaveBeenCalledTimes(1))

    rerender(<GenerateActions isValid onGenerate={onGenerate} finalPrompt="the final prompt" />)

    const copyButton = screen.getByRole('button', { name: /copy/i })
    await user.click(copyButton)

    expect(writeText).toHaveBeenCalledWith('the final prompt')
    expect(await screen.findByRole('status')).toHaveTextContent(/copied/i)
  })

  it('shows the guest quota message when generation fails with GUEST_QUOTA_EXCEEDED', async () => {
    const user = userEvent.setup()
    const onGenerate = vi
      .fn()
      .mockRejectedValue(new ApiError('GUEST_QUOTA_EXCEEDED', 'quota exceeded', 429))
    render(<GenerateActions isValid onGenerate={onGenerate} finalPrompt={null} />)

    await user.click(screen.getByRole('button', { name: /generate prompt/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/limit/i)
  })

  it('shows a generic retry-able message on a non-quota failure and fabricates no result', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn().mockRejectedValue(new ApiError('INTERNAL_ERROR', 'boom', 500))
    render(<GenerateActions isValid onGenerate={onGenerate} finalPrompt={null} />)

    await user.click(screen.getByRole('button', { name: /generate prompt/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to generate/i)
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument()
  })

  it('disables the Generate button while the form is invalid', () => {
    render(<GenerateActions isValid={false} onGenerate={vi.fn()} finalPrompt={null} />)
    expect(screen.getByRole('button', { name: /generate prompt/i })).toBeDisabled()
  })

  // C1 (analyze finding, FR-009): the FE must surface whatever generatedPromptId the
  // mock returns rather than assuming either case is always true.
  it('C1: mock generatedPromptId is non-null for a signed-in call and null for a guest call', async () => {
    const authenticatedClient = createMockGenerateClient('some-access-token')
    const guestClient = createMockGenerateClient(undefined)

    const authenticatedResult = await authenticatedClient.generate('template-1', {
      aiModelCode: 'gpt-4',
      inputValues: {},
    })
    const guestResult = await guestClient.generate('template-1', {
      aiModelCode: 'gpt-4',
      inputValues: {},
    })

    expect(authenticatedResult.generatedPromptId).not.toBeNull()
    expect(guestResult.generatedPromptId).toBeNull()
  })
})
