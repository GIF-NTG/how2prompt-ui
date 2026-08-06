import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface HistoryPromptDetailProps {
  finalPrompt: string
  extraInstructions: string | null
}

/** Read-only view of a history entry's full generated prompt (FR: "xem chi
 *  tiết prompt trong lịch sử") — the list only shows a truncated
 *  `promptSnippet`, this shows the complete `finalPrompt` saved server-side. */
export function HistoryPromptDetail({ finalPrompt, extraInstructions }: HistoryPromptDetailProps) {
  const [justCopied, setJustCopied] = useState(false)

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
    </section>
  )
}
