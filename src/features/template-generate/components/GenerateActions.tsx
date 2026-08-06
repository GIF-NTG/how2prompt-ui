import { useState } from 'react'
import { AlertCircle, Check, CheckCircle2, Copy, Sparkles } from 'lucide-react'
import { ApiError } from '@/shared/utils/httpClient'
import { TAG_ACCENT_PALETTE_LIGHT } from '@/shared/utils/colorTag'
import type { GenerateResponse } from '../api/generateClient.types'

// Only visitors who successfully generate a prompt ever trigger this, so
// load canvas-confetti on demand instead of paying for it on every visit.
// Purely decorative — never let a failure here surface as a generate error.
async function fireSuccessConfetti() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const { default: confetti } = await import('canvas-confetti')
    confetti({
      particleCount: 60,
      spread: 65,
      startVelocity: 35,
      origin: { y: 0.7 },
      colors: ['#3652E0', ...TAG_ACCENT_PALETTE_LIGHT],
    })
  } catch {
    // decorative only — ignore (e.g. matchMedia unavailable, chunk load failure)
  }
}

interface GenerateActionsProps {
  isValid: boolean
  finalPrompt: string | null
  onGenerate: () => Promise<GenerateResponse>
}

const GENERIC_ERROR_MESSAGE = 'Unable to generate the prompt right now, please try again.'
const QUOTA_ERROR_MESSAGE =
  "You've reached today's free prompt generation limit. Log in to continue, or come back tomorrow."

export function GenerateActions({ isValid, finalPrompt, onGenerate }: GenerateActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [justCopied, setJustCopied] = useState(false)

  const handleGenerateClick = async () => {
    setErrorMessage(null)
    setCopyStatus(null)
    setIsGenerating(true)
    try {
      await onGenerate()
      void fireSuccessConfetti()
    } catch (error) {
      if (error instanceof ApiError && error.code === 'GUEST_QUOTA_EXCEEDED') {
        setErrorMessage(QUOTA_ERROR_MESSAGE)
      } else {
        setErrorMessage(GENERIC_ERROR_MESSAGE)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyClick = async () => {
    if (!finalPrompt) {
      return
    }
    await navigator.clipboard.writeText(finalPrompt)
    setCopyStatus('Copied to clipboard')
    setJustCopied(true)
    setTimeout(() => setJustCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={!isValid || isGenerating}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-gradient-to-r from-[#3652E0] to-[#5D6EF5] px-4 py-2 text-sm font-medium text-white transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:from-[#8493FF] dark:to-[#A6B4FF] dark:text-[#14171A]"
        >
          <Sparkles size={15} aria-hidden="true" />
          {isGenerating ? 'Generating...' : 'Generate prompt'}
        </button>
        {finalPrompt && (
          <button
            type="button"
            onClick={handleCopyClick}
            className="animate-[fade-slide-up_200ms_ease] inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#E2E5DC] px-4 py-2 text-sm font-medium text-[#14171A] transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:text-[#F3F5F0]"
          >
            {justCopied ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Copy size={15} aria-hidden="true" />
            )}
            Copy
          </button>
        )}
      </div>
      {copyStatus && (
        <p
          role="status"
          className="m-0 flex animate-[fade-slide-up_150ms_ease] items-center gap-2 rounded-lg border border-[#2E7D4F]/40 bg-[#E7F5EC] px-4 py-2 text-sm leading-normal text-[#2E7D4F] dark:border-[#6FCF9A]/40 dark:bg-[#1F3A2A] dark:text-[#6FCF9A]"
        >
          <CheckCircle2 size={16} className="flex-shrink-0" aria-hidden="true" />
          {copyStatus}
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="m-0 flex animate-[fade-slide-up_150ms_ease] items-center gap-2 rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-2 text-sm leading-normal text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]"
        >
          <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
