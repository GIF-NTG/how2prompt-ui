interface PromptsTrendChartProps {
  entries: [string, number][]
}

function formatDayLabel(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}

/** Bar-chart rendering of `promptsGeneratedPerDay` for the selected range —
 *  pure CSS bars, no charting dependency needed for a single series. */
export function PromptsTrendChart({ entries }: PromptsTrendChartProps) {
  if (entries.length === 0) {
    return (
      <p className="m-0 text-sm text-[#8B8F86] dark:text-[#6D726A]">
        No data in the selected range.
      </p>
    )
  }

  const max = Math.max(...entries.map(([, count]) => count), 1)

  return (
    <div className="flex h-full items-stretch gap-1">
      {entries.map(([date, count]) => (
        <div
          key={date}
          tabIndex={0}
          aria-label={`${formatDayLabel(date)}: ${count} prompts`}
          className="group relative flex h-full flex-1 flex-col items-center justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0]"
        >
          <span className="pointer-events-none absolute -top-6 hidden whitespace-nowrap rounded-md bg-[#1B1D1B] px-1.5 py-0.5 font-mono text-[0.65rem] text-[#F3F5F0] group-hover:block group-focus:block dark:bg-[#ECEEE8] dark:text-[#14171A]">
            {formatDayLabel(date)} · {count}
          </span>
          <div
            className="w-full rounded-t-sm bg-[#3652E0] transition-[height] dark:bg-[#8493FF]"
            style={{ height: `${Math.max((count / max) * 100, 4)}%` }}
          />
        </div>
      ))}
    </div>
  )
}
