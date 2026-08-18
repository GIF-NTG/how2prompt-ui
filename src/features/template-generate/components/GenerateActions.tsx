import { useState } from 'react'
import { AlertCircle, Sparkles } from 'lucide-react'
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
  onGenerate: () => Promise<GenerateResponse>
}

const GENERIC_ERROR_MESSAGE = 'Unable to generate the prompt right now, please try again.'
const QUOTA_ERROR_MESSAGE =
  "You've reached today's free prompt generation limit. Log in to continue, or come back tomorrow."

/** Just the Generate action + its own error state. Copy and Refine now live
 *  next to the Result panel instead of here — see `CopyResultButton` and
 *  `TemplateGenerateSection`'s aside, since both only make sense once a
 *  result exists to act on, which visually reads better next to that result
 *  than clustered under the form. */
export function GenerateActions({ isValid, onGenerate }: GenerateActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleGenerateClick = async () => {
    setErrorMessage(null)
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

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGenerateClick}
        disabled={!isValid || isGenerating}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-gradient-to-r from-[#3652E0] to-[#5D6EF5] px-4 py-2 text-sm font-medium text-white transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:from-[#8493FF] dark:to-[#A6B4FF] dark:text-[#14171A]"
      >
        <Sparkles size={15} aria-hidden="true" />
        {isGenerating ? 'Generating…' : 'Generate prompt'}
      </button>
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
