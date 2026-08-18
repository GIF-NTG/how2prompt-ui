import { AlertCircle, Wand2 } from 'lucide-react'
import type { RefineFlowState } from '../hooks/useRefinePrompt.types'

interface RefineTriggerProps {
  /** `generatedPromptId !== null && session.emailVerified` — see FR-002. */
  eligible: boolean
  state: RefineFlowState
  errorMessage: string | null
  onRefine: () => void
}

/** "Refine with AI" trigger + inline error message, styled to match
 *  `GenerateActions.tsx`'s secondary-button and alert conventions. */
export function RefineTrigger({ eligible, state, errorMessage, onRefine }: RefineTriggerProps) {
  if (!eligible) {
    return null
  }

  const isLoading = state === 'loading'

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onRefine}
        disabled={isLoading}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-[#E2E5DC] px-4 py-2 text-sm font-medium text-[#14171A] transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:border-[#2C3130] dark:text-[#F3F5F0]"
      >
        <Wand2 size={15} aria-hidden="true" />
        {isLoading ? 'Refining…' : 'Refine with AI'}
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
