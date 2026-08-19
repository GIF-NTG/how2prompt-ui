import { AlertTriangle } from 'lucide-react'
import type { ScoreResult } from '../api/aiEnhanceClient.types'
import { RadarChart } from './RadarChart'

interface ScoreResultViewProps {
  result: ScoreResult | null
}

/** Read-only rendering of a score result: radar chart, overall score,
 *  suggestions list, and the "AI assessment for reference only" disclaimer
 *  (FR-005). */
export function ScoreResultView({ result }: ScoreResultViewProps) {
  if (!result) {
    return null
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <RadarChart breakdown={result.breakdown} />
        <div className="flex flex-col gap-1">
          <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#5B5F58] dark:text-[#A2A79C]">
            Overall Score
          </span>
          <span className="text-3xl font-bold text-[#14171A] dark:text-[#F3F5F0]">
            {result.score}
          </span>
          <span className="text-[0.7rem] text-[#5B5F58] dark:text-[#A2A79C]">out of 10</span>
        </div>
      </div>

      {result.suggestions.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-[#E2E5DC] pt-3 dark:border-[#2C3130]">
          <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#5B5F58] dark:text-[#A2A79C]">
            Suggestions
          </span>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[0.85rem] leading-relaxed text-[#3A3F38] dark:text-[#C7CBC3]">
            {result.suggestions.map((suggestion) => (
              <li key={suggestion} className="flex gap-2">
                <span
                  className="mt-[0.5em] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3652E0] dark:bg-[#8493FF]"
                  aria-hidden="true"
                />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="m-0 text-sm text-[#5B5F58] dark:text-[#A2A79C]">No suggestions</p>
      )}

      <p className="m-0 flex items-center gap-1.5 text-[0.75rem] text-[#5B5F58] dark:text-[#A2A79C]">
        <AlertTriangle size={12} aria-hidden="true" />
        AI assessment for reference only
      </p>
    </section>
  )
}
