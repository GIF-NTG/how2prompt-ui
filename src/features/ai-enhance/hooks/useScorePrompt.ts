import { useCallback, useRef, useState } from 'react'
import { ApiError } from '@/shared/utils/httpClient'
import type { AiEnhanceClient } from '../api/aiEnhanceClient.types'
import type { ScoreFlowState } from './useScorePrompt.types'

const ERROR_MESSAGES: Record<string, string> = {
  RATE_LIMITED: 'Too many requests — please wait a moment and try again.',
  AI_TIMEOUT: 'The AI took too long to respond. Please try again.',
  AI_UNAVAILABLE: 'The AI service is temporarily unavailable. Please try again shortly.',
}
const GENERIC_SCORE_ERROR = "Couldn't score this prompt, please try again."

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.code] ?? GENERIC_SCORE_ERROR
  }
  return GENERIC_SCORE_ERROR
}

interface UseScorePromptOptions {
  client: AiEnhanceClient
  generatedPromptId: string | null
}

interface UseScorePromptResult {
  state: ScoreFlowState
  result: import('../api/aiEnhanceClient.types').ScoreResult | null
  errorMessage: string | null
  score: () => Promise<void>
}

/** Drives the US-6.2 score state machine
 *  (idle -> loading -> result | error) for one generated prompt. Shared by
 *  both surfaces that show a generated prompt's final text — see
 *  research.md's "one shared hook" decision. */
export function useScorePrompt({
  client,
  generatedPromptId,
}: UseScorePromptOptions): UseScorePromptResult {
  const [state, setState] = useState<ScoreFlowState>('idle')
  const [result, setResult] = useState<import('../api/aiEnhanceClient.types').ScoreResult | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isInFlight = useRef(false)

  const score = useCallback(async () => {
    if (isInFlight.current || !generatedPromptId) {
      return
    }
    isInFlight.current = true
    setState('loading')
    setErrorMessage(null)
    try {
      const response = await client.score(generatedPromptId)
      setResult(response)
      setState('result')
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
      setState('error')
    } finally {
      isInFlight.current = false
    }
  }, [client, generatedPromptId])

  return { state, result, errorMessage, score }
}
