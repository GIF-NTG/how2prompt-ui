import { useState } from 'react'
import { Check, CheckCircle2, Copy } from 'lucide-react'

interface CopyResultButtonProps {
  text: string
}

/** Copy action for the Result panel — split out of `GenerateActions` so it
 *  can render next to the result it copies instead of under the form. */
export function CopyResultButton({ text }: CopyResultButtonProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [justCopied, setJustCopied] = useState(false)

  async function handleCopyClick() {
    await navigator.clipboard.writeText(text)
    setCopyStatus('Copied to clipboard')
    setJustCopied(true)
    setTimeout(() => setJustCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void handleCopyClick()}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-[#E2E5DC] px-4 py-2 text-sm font-medium text-[#14171A] transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:text-[#F3F5F0]"
      >
        {justCopied ? (
          <Check size={15} aria-hidden="true" />
        ) : (
          <Copy size={15} aria-hidden="true" />
        )}
        Copy
      </button>
      {copyStatus && (
        <p
          role="status"
          className="m-0 flex animate-[fade-slide-up_150ms_ease] items-center gap-2 rounded-lg border border-[#2E7D4F]/40 bg-[#E7F5EC] px-4 py-2 text-sm leading-normal text-[#2E7D4F] dark:border-[#6FCF9A]/40 dark:bg-[#1F3A2A] dark:text-[#6FCF9A]"
        >
          <CheckCircle2 size={16} className="flex-shrink-0" aria-hidden="true" />
          {copyStatus}
        </p>
      )}
    </div>
  )
}
