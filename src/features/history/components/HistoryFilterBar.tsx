import { useEffect, useState } from 'react'
import { templateClient } from '@/features/home/api/templateClient'
import type { AiModel } from '@/features/home/types'
import type { HistoryFilters } from '../types'

interface TemplateOption {
  id: string
  title: string
}

interface HistoryFilterBarProps {
  filters: HistoryFilters
  templateOptions: TemplateOption[]
  onTemplateChange: (templateId: string) => void
  onModelChange: (model: string) => void
  onFromChange: (from: string) => void
  onToChange: (to: string) => void
}

const SELECT_CLASSES =
  'font-[inherit] cursor-pointer rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'

const DATE_CLASSES =
  'font-[inherit] cursor-pointer rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.55rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'

export function HistoryFilterBar({
  filters,
  templateOptions,
  onTemplateChange,
  onModelChange,
  onFromChange,
  onToChange,
}: HistoryFilterBarProps) {
  const [models, setModels] = useState<AiModel[]>([])

  useEffect(() => {
    let cancelled = false
    templateClient.getModels().then((data) => {
      if (!cancelled) setModels(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Lọc theo template"
        value={filters.templateId}
        onChange={(e) => onTemplateChange(e.target.value)}
        className={SELECT_CLASSES}
      >
        <option value="">Tất cả template</option>
        {templateOptions.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>

      <select
        aria-label="Lọc theo model AI"
        value={filters.model}
        onChange={(e) => onModelChange(e.target.value)}
        className={SELECT_CLASSES}
      >
        <option value="">Tất cả model AI</option>
        {models.map((m) => (
          <option key={m.id} value={m.code}>
            {m.name}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-[0.8rem] text-[#5B5F58] dark:text-[#A2A79C]">
        Từ
        <input
          type="date"
          aria-label="Từ ngày"
          value={filters.from}
          onChange={(e) => onFromChange(e.target.value)}
          className={DATE_CLASSES}
        />
      </label>

      <label className="flex items-center gap-1.5 text-[0.8rem] text-[#5B5F58] dark:text-[#A2A79C]">
        Đến
        <input
          type="date"
          aria-label="Đến ngày"
          value={filters.to}
          onChange={(e) => onToChange(e.target.value)}
          className={DATE_CLASSES}
        />
      </label>
    </div>
  )
}
