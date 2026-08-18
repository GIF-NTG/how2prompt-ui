import { useEffect, useMemo } from 'react'
import { useHomeData } from '@/features/home/context/useHomeData'
import { SelectMenu } from '@/shared/components/SelectMenu'
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
  const { models, ensureModels } = useHomeData()

  useEffect(() => {
    void ensureModels()
  }, [ensureModels])

  const templateSelectOptions = useMemo(
    () => [
      { value: '', label: 'All templates' },
      ...templateOptions.map((t) => ({ value: t.id, label: t.title })),
    ],
    [templateOptions],
  )

  const modelSelectOptions = useMemo(
    () => [
      { value: '', label: 'All AI models' },
      ...models.map((m) => ({ value: m.code, label: m.name })),
    ],
    [models],
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectMenu
        value={filters.templateId}
        options={templateSelectOptions}
        onChange={onTemplateChange}
        ariaLabel="Filter by template"
      />

      <SelectMenu
        value={filters.model}
        options={modelSelectOptions}
        onChange={onModelChange}
        ariaLabel="Filter by AI model"
      />

      <label className="flex items-center gap-1.5 text-[0.8rem] text-[#5B5F58] dark:text-[#A2A79C]">
        From
        <input
          type="date"
          aria-label="From date"
          value={filters.from}
          onChange={(e) => onFromChange(e.target.value)}
          className={DATE_CLASSES}
        />
      </label>

      <label className="flex items-center gap-1.5 text-[0.8rem] text-[#5B5F58] dark:text-[#A2A79C]">
        To
        <input
          type="date"
          aria-label="To date"
          value={filters.to}
          onChange={(e) => onToChange(e.target.value)}
          className={DATE_CLASSES}
        />
      </label>
    </div>
  )
}
