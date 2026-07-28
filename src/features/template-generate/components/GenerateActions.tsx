import { useState } from 'react'
import { AlertCircle, Check, CheckCircle2, Copy, Sparkles } from 'lucide-react'
import { ApiError } from '@/shared/utils/httpClient'
import type { GenerateResponse } from '../api/generateClient.types'

interface GenerateActionsProps {
  isValid: boolean
  finalPrompt: string | null
  onGenerate: () => Promise<GenerateResponse>
}

const GENERIC_ERROR_MESSAGE = 'Không thể tạo prompt lúc này, vui lòng thử lại.'
const QUOTA_ERROR_MESSAGE =
  'Bạn đã đạt giới hạn tạo prompt miễn phí hôm nay. Đăng nhập để tiếp tục hoặc quay lại vào ngày mai.'

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
    setCopyStatus('Đã sao chép vào clipboard')
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
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#3652E0] px-4 py-2 text-sm font-medium text-white transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:bg-[#8493FF] dark:text-[#14171A]"
        >
          <Sparkles size={15} aria-hidden="true" />
          {isGenerating ? 'Đang tạo...' : 'Tạo prompt'}
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
            Sao chép
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
