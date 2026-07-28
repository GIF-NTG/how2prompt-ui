import type { GenerateResponse } from '../api/generateClient.types'

interface OutputBoxProps {
  result: GenerateResponse | null
}

export function OutputBox({ result }: OutputBoxProps) {
  if (!result) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 rounded-[8px] border border-[#E2E5DC] bg-[#F3F5F0] p-4 dark:border-[#2C3130] dark:bg-[#14171A]">
      <h3 className="m-0 text-sm font-semibold text-[#14171A] dark:text-[#F3F5F0]">Kết quả</h3>
      <pre className="m-0 whitespace-pre-wrap font-mono text-sm text-[#14171A] dark:text-[#F3F5F0]">
        {result.finalPrompt}
      </pre>
      <p className="m-0 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
        ~{result.tokensEstimate} tokens
        {result.remainingQuota !== null && ` · Còn ${result.remainingQuota} lượt tạo hôm nay`}
      </p>
    </div>
  )
}
