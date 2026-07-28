import { useState } from 'react'
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
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={!isValid || isGenerating}
          className="rounded-[6px] bg-[#3652E0] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#8493FF] dark:text-[#14171A]"
        >
          {isGenerating ? 'Đang tạo...' : 'Tạo prompt'}
        </button>
        {finalPrompt && (
          <button
            type="button"
            onClick={handleCopyClick}
            className="rounded-[6px] border border-[#E2E5DC] px-4 py-2 text-sm font-medium text-[#14171A] dark:border-[#2C3130] dark:text-[#F3F5F0]"
          >
            Sao chép
          </button>
        )}
      </div>
      {copyStatus && (
        <p role="status" className="m-0 text-sm text-[#2E7D4F] dark:text-[#6FCF9A]">
          {copyStatus}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="m-0 text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
