import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/utils/httpClient'
import type { AiEnhanceClient, RefineResult } from '../api/aiEnhanceClient.types'
import { useRefinePrompt } from './useRefinePrompt'

function makeRefineResult(overrides: Partial<RefineResult> = {}): RefineResult {
  return {
    promptId: 'gp1',
    originalPrompt: 'Write a story.',
    refinedPrompt: 'Write a 500-word story about a robot.',
    explanations: ['Added a word count.'],
    modelVersion: 'test-v1',
    ...overrides,
  }
}

function makeClient(overrides: Partial<AiEnhanceClient> = {}): AiEnhanceClient {
  return {
    refine: vi.fn().mockResolvedValue(makeRefineResult()),
    acceptRefine: vi.fn().mockResolvedValue(undefined),
    discardRefine: vi.fn().mockResolvedValue(undefined),
    score: vi.fn(),
    translate: vi.fn(),
    runPlayground: vi.fn(),
    share: vi.fn(),
    unshare: vi.fn(),
    getPublicSharedPrompt: vi.fn(),
    ...overrides,
  }
}

describe('useRefinePrompt', () => {
  it('transitions idle -> loading -> result on a successful refine', async () => {
    const client = makeClient()
    const { result } = renderHook(() =>
      useRefinePrompt({ client, generatedPromptId: 'gp1', onAccepted: vi.fn() }),
    )

    expect(result.current.state).toBe('idle')

    act(() => {
      void result.current.refine()
    })
    expect(result.current.state).toBe('loading')

    await waitFor(() => expect(result.current.state).toBe('result'))
    expect(result.current.result?.refinedPrompt).toBe('Write a 500-word story about a robot.')
  })

  it('does not fire a second refine request while one is already in flight', async () => {
    const refine = vi.fn().mockResolvedValue(makeRefineResult())
    const client = makeClient({ refine })
    const { result } = renderHook(() =>
      useRefinePrompt({ client, generatedPromptId: 'gp1', onAccepted: vi.fn() }),
    )

    act(() => {
      void result.current.refine()
      void result.current.refine()
    })
    await waitFor(() => expect(result.current.state).toBe('result'))

    expect(refine).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['AI_QUOTA_EXCEEDED', /allowance/i],
    ['RATE_LIMITED', /too many requests/i],
    ['AI_TIMEOUT', /took too long/i],
    ['AI_UNAVAILABLE', /unavailable/i],
    ['AI_CONTENT_FILTERED', /flagged/i],
  ])('surfaces a distinct message for %s', async (code, expectedMessage) => {
    const client = makeClient({
      refine: vi.fn().mockRejectedValue(new ApiError(code, 'boom', 500)),
    })
    const { result } = renderHook(() =>
      useRefinePrompt({ client, generatedPromptId: 'gp1', onAccepted: vi.fn() }),
    )

    act(() => {
      void result.current.refine()
    })
    await waitFor(() => expect(result.current.state).toBe('error'))

    expect(result.current.errorMessage).toMatch(expectedMessage)
  })

  it('falls back to a generic message for an unrecognized error code', async () => {
    const client = makeClient({
      refine: vi.fn().mockRejectedValue(new ApiError('INTERNAL_ERROR', 'boom', 500)),
    })
    const { result } = renderHook(() =>
      useRefinePrompt({ client, generatedPromptId: 'gp1', onAccepted: vi.fn() }),
    )

    act(() => {
      void result.current.refine()
    })
    await waitFor(() => expect(result.current.state).toBe('error'))

    expect(result.current.errorMessage).toMatch(/unable to refine/i)
  })

  it('accepts the refinement as-is and calls onAccepted with the refined text', async () => {
    const acceptRefine = vi.fn().mockResolvedValue(undefined)
    const onAccepted = vi.fn()
    const client = makeClient({ acceptRefine })
    const { result } = renderHook(() =>
      useRefinePrompt({ client, generatedPromptId: 'gp1', onAccepted }),
    )

    act(() => {
      void result.current.refine()
    })
    await waitFor(() => expect(result.current.state).toBe('result'))

    act(() => {
      void result.current.acceptRefine()
    })
    await waitFor(() => expect(result.current.state).toBe('idle'))

    expect(acceptRefine).toHaveBeenCalledWith('gp1', undefined)
    expect(onAccepted).toHaveBeenCalledWith('Write a 500-word story about a robot.')
  })

  it('accepts a hand-edited override and calls onAccepted with the edited text', async () => {
    const acceptRefine = vi.fn().mockResolvedValue(undefined)
    const onAccepted = vi.fn()
    const client = makeClient({ acceptRefine })
    const { result } = renderHook(() =>
      useRefinePrompt({ client, generatedPromptId: 'gp1', onAccepted }),
    )

    act(() => {
      void result.current.refine()
    })
    await waitFor(() => expect(result.current.state).toBe('result'))

    act(() => {
      void result.current.acceptRefine('my edited version')
    })
    await waitFor(() => expect(result.current.state).toBe('idle'))

    expect(acceptRefine).toHaveBeenCalledWith('gp1', 'my edited version')
    expect(onAccepted).toHaveBeenCalledWith('my edited version')
  })

  it('discards the pending refinement without touching the final prompt', async () => {
    const discardRefine = vi.fn().mockResolvedValue(undefined)
    const onAccepted = vi.fn()
    const client = makeClient({ discardRefine })
    const { result } = renderHook(() =>
      useRefinePrompt({ client, generatedPromptId: 'gp1', onAccepted }),
    )

    act(() => {
      void result.current.refine()
    })
    await waitFor(() => expect(result.current.state).toBe('result'))

    act(() => {
      void result.current.discardRefine()
    })
    await waitFor(() => expect(result.current.state).toBe('idle'))

    expect(discardRefine).toHaveBeenCalledWith('gp1')
    expect(onAccepted).not.toHaveBeenCalled()
    expect(result.current.result).toBeNull()
  })
})
