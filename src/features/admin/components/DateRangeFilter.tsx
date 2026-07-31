import { useState } from 'react'
import type { DashboardDateRange } from '../api/dashboardClient.types'
import { daysAgoIso } from '../utils/dateRange'

interface DateRangeFilterProps {
  range: DashboardDateRange
  onChange: (range: DashboardDateRange) => void
}

const PRESETS = [
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 },
]

/** Custom date-range filter for the analytics dashboard (FR-016), styled per
 *  the mockup's `.range-group` preset chips. A "Tuỳ chỉnh" toggle reveals the
 *  underlying from/to date inputs for an arbitrary range the chips can't
 *  express. */
export function DateRangeFilter({ range, onChange }: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<number | null>(30)
  const [customOpen, setCustomOpen] = useState(false)

  function applyPreset(days: number) {
    setActivePreset(days)
    setCustomOpen(false)
    onChange({ from: daysAgoIso(days), to: null })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="Khoảng thời gian"
        className="flex gap-1 rounded-[10px] border border-[#DBDFD3] bg-[#EAEDE6] p-1 dark:border-[#2C3130] dark:bg-[#23282C]"
      >
        {PRESETS.map((preset) => (
          <button
            key={preset.days}
            type="button"
            aria-pressed={activePreset === preset.days}
            onClick={() => applyPreset(preset.days)}
            className={`rounded-[7px] px-3 py-1.5 text-sm font-semibold transition-colors ${
              activePreset === preset.days
                ? 'bg-white text-[#1B1D1B] shadow-[0_1px_0_#DBDFD3] dark:bg-[#1C2024] dark:text-[#ECEEE8] dark:shadow-[0_1px_0_#2C3130]'
                : 'text-[#5B5F58] dark:text-[#A2A79C]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setActivePreset(null)
          setCustomOpen((open) => !open)
        }}
        className="rounded-[10px] border border-[#DBDFD3] px-3 py-2 text-sm font-semibold text-[#1B1D1B] transition-colors hover:bg-[#EAEDE6] dark:border-[#2C3130] dark:text-[#ECEEE8] dark:hover:bg-[#23282C]"
      >
        Tuỳ chỉnh
      </button>

      {customOpen && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-[#5B5F58] dark:text-[#A2A79C]">Từ ngày</span>
            <input
              type="date"
              value={range.from ?? ''}
              onChange={(e) => onChange({ ...range, from: e.target.value || null })}
              className="rounded-lg border border-[#DBDFD3] bg-transparent px-3 py-2 text-sm focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:focus:border-[#8493FF]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-[#5B5F58] dark:text-[#A2A79C]">Đến ngày</span>
            <input
              type="date"
              value={range.to ?? ''}
              onChange={(e) => onChange({ ...range, to: e.target.value || null })}
              className="rounded-lg border border-[#DBDFD3] bg-transparent px-3 py-2 text-sm focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:focus:border-[#8493FF]"
            />
          </label>
        </div>
      )}
    </div>
  )
}
