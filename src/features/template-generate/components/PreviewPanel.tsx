import { useMemo } from 'react'
import { renderTemplate, renderTemplateText, estimateTokens } from '../utils/renderTemplate'

interface PreviewPanelProps {
  promptBody: string
  inputValues: Record<string, string | number | boolean | string[]>
  extraInstructions?: string
}

export function PreviewPanel({ promptBody, inputValues, extraInstructions }: PreviewPanelProps) {
  const segments = useMemo(
    () => renderTemplate(promptBody, inputValues),
    [promptBody, inputValues],
  )
  const trimmedExtra = extraInstructions?.trim() ?? ''
  const text = useMemo(() => {
    const rendered = renderTemplateText(segments)
    return trimmedExtra ? `${rendered}\n\n${trimmedExtra}` : rendered
  }, [segments, trimmedExtra])
  const tokensEstimate = useMemo(() => estimateTokens(text), [text])

  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-sm font-semibold text-[#14171A] dark:text-[#F3F5F0]">Xem trước</h3>
      <pre className="m-0 whitespace-pre-wrap rounded-[8px] border border-[#E2E5DC] bg-[#F3F5F0] p-4 font-mono text-sm text-[#14171A] dark:border-[#2C3130] dark:bg-[#14171A] dark:text-[#F3F5F0]">
        {segments.map((segment, index) =>
          segment.type === 'placeholder' && !segment.filled ? (
            <mark
              key={index}
              className="rounded-[3px] bg-[#FFF1B8] px-1 text-[#8A6D00] dark:bg-[#4A3F1A] dark:text-[#F3D77A]"
            >
              {segment.value}
            </mark>
          ) : (
            <span key={index}>{segment.value}</span>
          ),
        )}
        {trimmedExtra && <span>{'\n\n' + trimmedExtra}</span>}
      </pre>
      <p className="m-0 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
        {text.length} ký tự · ~{tokensEstimate} tokens
      </p>
    </div>
  )
}
