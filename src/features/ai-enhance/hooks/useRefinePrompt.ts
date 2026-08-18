import { useCallback, useRef, useState } from 'react'
import { ApiError } from '@/shared/utils/httpClient'
import type { AiEnhanceClient } from '../api/aiEnhanceClient.types'
import type { RefineFlowState, RefinementResult } from './useRefinePrompt.types'

const ERROR_MESSAGES: Record<string, string> = {
  AI_QUOTA_EXCEEDED: "You've used up today's AI Refine allowance. It resets tomorrow.",
  RATE_LIMITED: 'Too many requests — please wait a moment and try again.',
  AI_TIMEOUT: 'The AI took too long to respond. Please try again.',
  AI_UNAVAILABLE: 'The AI service is temporarily unavailable. Please try again shortly.',
  AI_CONTENT_FILTERED: 'This prompt was flagged by the content filter — try rephrasing it.',
}
const GENERIC_REFINE_ERROR = 'Unable to refine this prompt right now, please try again.'

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.code] ?? GENERIC_REFINE_ERROR
  }
  return GENERIC_REFINE_ERROR
}

interface UseRefinePromptOptions {
  client: AiEnhanceClient
  generatedPromptId: string | null
  /** Called with the prompt's new final text once a refinement is accepted. */
  onAccepted: (finalPrompt: string) => void
}

interface UseRefinePromptResult {
  state: RefineFlowState
  result: RefinementResult | null
  errorMessage: string | null
  refine: () => Promise<void>
  acceptRefine: (editedText?: string) => Promise<void>
  discardRefine: () => Promise<void>
}

/** Drives the US-6.1 refine/accept/discard state machine
 *  (idle -> loading -> result -> idle) for one generated prompt. Shared by
 *  both surfaces that show a generated prompt's final text — see
 *  research.md's "one shared hook" decision. */
export function useRefinePrompt({
  client,
  generatedPromptId,
  onAccepted,
}: UseRefinePromptOptions): UseRefinePromptResult {
  const [state, setState] = useState<RefineFlowState>('idle')
  const [result, setResult] = useState<RefinementResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isInFlight = useRef(false)

  const refine = useCallback(async () => {
    if (isInFlight.current || !generatedPromptId) {
      return
    }
    isInFlight.current = true
    setState('loading')
    setErrorMessage(null)
    try {
      const response = await client.refine(generatedPromptId)
      setResult({ ...response, editedPrompt: null })
      setState('result')
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
      setState('error')
    } finally {
      isInFlight.current = false
    }
  }, [client, generatedPromptId])

  const acceptRefine = useCallback(
    async (editedText?: string) => {
      if (!generatedPromptId || !result) {
        return
      }
      await client.acceptRefine(generatedPromptId, editedText)
      onAccepted(editedText ?? result.refinedPrompt)
      setResult(null)
      setState('idle')
    },
    [client, generatedPromptId, result, onAccepted],
  )

  const discardRefine = useCallback(async () => {
    if (!generatedPromptId) {
      return
    }
    await client.discardRefine(generatedPromptId)
    setResult(null)
    setState('idle')
  }, [client, generatedPromptId])

  return { state, result, errorMessage, refine, acceptRefine, discardRefine }
}
