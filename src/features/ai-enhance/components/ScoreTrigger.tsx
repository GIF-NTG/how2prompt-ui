import { AlertCircle, Target } from 'lucide-react'
import type { ScoreFlowState } from '../hooks/useScorePrompt.types'

interface ScoreTriggerProps {
  generatedPromptId: string | null
  state: ScoreFlowState
  errorMessage: string | null
  onScore: () => void
}

/** "Score this prompt" trigger + inline error message, styled to match
 *  RefineTrigger's existing conventions. */
export function ScoreTrigger({
  generatedPromptId,
  state,
  errorMessage,
  onScore,
}: ScoreTriggerProps) {
  if (!generatedPromptId) {
    return null
  }

  const isLoading = state === 'loading'

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onScore}
        disabled={isLoading}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-[#E2E5DC] px-4 py-2 text-sm font-medium text-[#14171A] transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:border-[#2C3130] dark:text-[#F3F5F0]"
      >
        <Target size={15} aria-hidden="true" />
        {isLoading ? 'Scoring…' : 'Score this prompt'}
      </button>
      {state === 'error' && errorMessage && (
        <p
          role="alert"
          className="m-0 flex items-center gap-2 rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-2 text-sm leading-normal text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]"
        >
          <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
