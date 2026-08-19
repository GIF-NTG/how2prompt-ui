import type { AiEnhanceClient, ScoreResult } from '../api/aiEnhanceClient.types'

export type ScoreFlowState = 'idle' | 'loading' | 'result' | 'error'

export interface UseScorePromptOptions {
  client: AiEnhanceClient
  generatedPromptId: string | null
}

export interface UseScorePromptResult {
  state: ScoreFlowState
  result: ScoreResult | null
  errorMessage: string | null
  score: () => Promise<void>
}
