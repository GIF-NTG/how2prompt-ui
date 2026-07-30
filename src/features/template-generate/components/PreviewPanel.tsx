import { useMemo } from 'react'
import { renderTemplate, renderTemplateText, estimateTokens } from '../utils/renderTemplate'
import type { GenerateResponse } from '../api/generateClient.types'

interface PreviewPanelProps {
  promptBody: string
  inputValues: Record<string, string | number | boolean | string[]>
  extraInstructions?: string
  /** Set once `POST /templates/{id}/generate` returns — the BE-authoritative
   *  rendering takes over this panel until the visitor edits the form again
   *  (TemplateGenerateSection clears it back to `null` on any input change). */
  result?: GenerateResponse | null
}

export function PreviewPanel({
  promptBody,
  inputValues,
  extraInstructions,
  result,
}: PreviewPanelProps) {
  const segments = useMemo(() => renderTemplate(promptBody, inputValues), [promptBody, inputValues])
  const trimmedExtra = extraInstructions?.trim() ?? ''
  const text = useMemo(() => {
    const rendered = renderTemplateText(segments)
    return trimmedExtra ? `${rendered}\n\n${trimmedExtra}` : rendered
  }, [segments, trimmedExtra])
  const tokensEstimate = useMemo(() => estimateTokens(text), [text])

  if (result) {
    return (
      <div className="flex animate-[fade-slide-up_250ms_ease] flex-col gap-2">
        <h3 className="m-0 text-sm font-semibold text-[#14171A] dark:text-[#F3F5F0]">Kết quả</h3>
        <pre className="m-0 whitespace-pre-wrap rounded-lg border border-[#E2E5DC] bg-[#F3F5F0] p-4 font-mono text-sm text-[#14171A] dark:border-[#2C3130] dark:bg-[#14171A] dark:text-[#F3F5F0]">
          {result.finalPrompt}
        </pre>
        <p className="m-0 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          ~{result.tokensEstimate} tokens
          {result.remainingQuota !== null && ` · Còn ${result.remainingQuota} lượt tạo hôm nay`}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-sm font-semibold text-[#14171A] dark:text-[#F3F5F0]">Xem trước</h3>
      <pre className="m-0 whitespace-pre-wrap rounded-lg border border-[#E2E5DC] bg-[#F3F5F0] p-4 font-mono text-sm text-[#14171A] transition-colors duration-300 dark:border-[#2C3130] dark:bg-[#14171A] dark:text-[#F3F5F0]">
        {segments.map((segment, index) =>
          segment.type === 'placeholder' ? (
            <span
              key={index}
              className={`rounded-xs px-1 transition-colors duration-300 ${
                segment.filled
                  ? 'bg-transparent'
                  : 'bg-[#FFF1B8] text-[#8A6D00] dark:bg-[#4A3F1A] dark:text-[#F3D77A]'
              }`}
            >
              {segment.value}
            </span>
          ) : (
            <span key={index}>{segment.value}</span>
          ),
        )}
        {trimmedExtra && (
          <span className="animate-[fade-slide-up_200ms_ease]">{'\n\n' + trimmedExtra}</span>
        )}
      </pre>
      <p className="m-0 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
        {text.length} ký tự · ~{tokensEstimate} tokens
      </p>
    </div>
  )
}
