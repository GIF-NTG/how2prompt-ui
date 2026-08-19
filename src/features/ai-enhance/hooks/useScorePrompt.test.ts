import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/utils/httpClient'
import type { AiEnhanceClient, ScoreResult } from '../api/aiEnhanceClient.types'
import { useScorePrompt } from './useScorePrompt'

function makeScoreResult(overrides: Partial<ScoreResult> = {}): ScoreResult {
  return {
    promptId: 'gp1',
    score: 8,
    breakdown: { clarity: 8, specificity: 7, context: 9, format: 8 },
    suggestions: ['Add an explicit output format.', 'Specify the target audience.'],
    modelVersion: 'test-v1',
    ...overrides,
  }
}

function makeClient(overrides: Partial<AiEnhanceClient> = {}): AiEnhanceClient {
  return {
    refine: vi.fn(),
    acceptRefine: vi.fn(),
    discardRefine: vi.fn(),
    score: vi.fn().mockResolvedValue(makeScoreResult()),
    translate: vi.fn(),
    runPlayground: vi.fn(),
    share: vi.fn(),
    unshare: vi.fn(),
    getPublicSharedPrompt: vi.fn(),
    ...overrides,
  }
}

describe('useScorePrompt', () => {
  it('transitions idle -> loading -> result on a successful score', async () => {
    const client = makeClient()
    const { result } = renderHook(() => useScorePrompt({ client, generatedPromptId: 'gp1' }))

    expect(result.current.state).toBe('idle')

    act(() => {
      void result.current.score()
    })
    expect(result.current.state).toBe('loading')

    await waitFor(() => expect(result.current.state).toBe('result'))
    expect(result.current.result?.score).toBe(8)
    expect(result.current.result?.breakdown).toEqual({
      clarity: 8,
      specificity: 7,
      context: 9,
      format: 8,
    })
  })

  it('does not fire a second score request while one is already in flight', async () => {
    const score = vi.fn().mockResolvedValue(makeScoreResult())
    const client = makeClient({ score })
    const { result } = renderHook(() => useScorePrompt({ client, generatedPromptId: 'gp1' }))

    act(() => {
      void result.current.score()
      void result.current.score()
    })
    await waitFor(() => expect(result.current.state).toBe('result'))

    expect(score).toHaveBeenCalledTimes(1)
  })

  it('re-scores when already in result state (re-score replaces previous result)', async () => {
    const score = vi
      .fn()
      .mockResolvedValueOnce(makeScoreResult({ score: 8 }))
      .mockResolvedValueOnce(makeScoreResult({ score: 9 }))
    const client = makeClient({ score })
    const { result } = renderHook(() => useScorePrompt({ client, generatedPromptId: 'gp1' }))

    act(() => {
      void result.current.score()
    })
    await waitFor(() => expect(result.current.state).toBe('result'))
    expect(result.current.result?.score).toBe(8)

    act(() => {
      void result.current.score()
    })
    await waitFor(() => expect(result.current.result?.score).toBe(9))
    expect(score).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['RATE_LIMITED', /too many requests/i],
    ['AI_TIMEOUT', /took too long/i],
    ['AI_UNAVAILABLE', /unavailable/i],
  ])('surfaces a distinct message for %s', async (code, expectedMessage) => {
    const client = makeClient({
      score: vi.fn().mockRejectedValue(new ApiError(code, 'boom', 500)),
    })
    const { result } = renderHook(() => useScorePrompt({ client, generatedPromptId: 'gp1' }))

    act(() => {
      void result.current.score()
    })
    await waitFor(() => expect(result.current.state).toBe('error'))

    expect(result.current.errorMessage).toMatch(expectedMessage)
  })

  it('falls back to a generic message for an unrecognized error code', async () => {
    const client = makeClient({
      score: vi.fn().mockRejectedValue(new ApiError('MALFORMED_RESPONSE', 'boom', 500)),
    })
    const { result } = renderHook(() => useScorePrompt({ client, generatedPromptId: 'gp1' }))

    act(() => {
      void result.current.score()
    })
    await waitFor(() => expect(result.current.state).toBe('error'))

    expect(result.current.errorMessage).toMatch(/couldn't score/i)
  })

  it('does not fire when generatedPromptId is null', async () => {
    const score = vi.fn()
    const client = makeClient({ score })
    const { result } = renderHook(() => useScorePrompt({ client, generatedPromptId: null }))

    act(() => {
      void result.current.score()
    })

    expect(score).not.toHaveBeenCalled()
    expect(result.current.state).toBe('idle')
  })
})
