import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useAuth } from '@/features/auth/context/useAuth'
import { createAiEnhanceClient } from '@/features/ai-enhance/api/aiEnhanceClient'
import { useRefinePrompt } from '@/features/ai-enhance/hooks/useRefinePrompt'
import { RefineTrigger } from '@/features/ai-enhance/components/RefineTrigger'
import { RefineDiffView } from '@/features/ai-enhance/components/RefineDiffView'

interface HistoryPromptDetailProps {
  generatedPromptId: string
  finalPrompt: string
  extraInstructions: string | null
  onFinalPromptRefined: (finalPrompt: string) => void
}

/** Read-only view of a history entry's full generated prompt (FR: "xem chi
 *  tiết prompt trong lịch sử") — the list only shows a truncated
 *  `promptSnippet`, this shows the complete `finalPrompt` saved server-side.
 *  Also hosts the US-6.1 "Refine with AI" flow for this same prompt. */
export function HistoryPromptDetail({
  generatedPromptId,
  finalPrompt,
  extraInstructions,
  onFinalPromptRefined,
}: HistoryPromptDetailProps) {
  const [justCopied, setJustCopied] = useState(false)
  const { session } = useAuth()
  const aiEnhanceClient = useMemo(() => createAiEnhanceClient(session?.token), [session?.token])
  const refineState = useRefinePrompt({
    client: aiEnhanceClient,
    generatedPromptId,
    onAccepted: onFinalPromptRefined,
  })

  async function handleCopy() {
    await navigator.clipboard.writeText(finalPrompt)
    setJustCopied(true)
    setTimeout(() => setJustCopied(false), 1500)
  }

  return (
    <section className="flex flex-col gap-3 rounded-panel border border-[#E2E5DC] bg-white p-4 dark:border-[#2C3130] dark:bg-[#1A1E1D]">
      <div className="flex flex-col gap-2 rounded-lg border border-[#E2E5DC] bg-[#F3F5F0] p-4 dark:border-[#2C3130] dark:bg-[#14171A]">
        <pre className="m-0 whitespace-pre-wrap font-mono text-sm text-[#14171A] dark:text-[#F3F5F0]">
          {finalPrompt}
        </pre>
      </div>

      {extraInstructions && (
        <p className="m-0 text-[0.8rem] text-[#5B5F58] dark:text-[#A2A79C]">
          <span className="font-semibold">Additional instructions:</span> {extraInstructions}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-[#E2E5DC] px-4 py-2 text-sm font-medium text-[#14171A] transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:text-[#F3F5F0]"
      >
        {justCopied ? (
          <Check size={15} aria-hidden="true" />
        ) : (
          <Copy size={15} aria-hidden="true" />
        )}
        Copy
      </button>

      <RefineTrigger
        eligible={Boolean(session?.emailVerified)}
        state={refineState.state}
        errorMessage={refineState.errorMessage}
        onRefine={() => void refineState.refine()}
      />
      <RefineDiffView
        result={refineState.result}
        onAccept={(editedText) => void refineState.acceptRefine(editedText)}
        onDiscard={() => void refineState.discardRefine()}
      />
    </section>
  )
}
