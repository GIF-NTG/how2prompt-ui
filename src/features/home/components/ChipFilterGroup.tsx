import { getTagColorClasses } from '@/shared/utils/colorTag'

interface ChipFilterGroupProps {
  items: { id: string; slug: string; label: string }[]
  /** Single-select: the active slug (or ''). Multi-select: the list of
   *  active slugs — pass `multiple` so "All" clears the whole selection
   *  instead of behaving like just another option. */
  value: string | string[]
  onChange: (slug: string) => void
  ariaLabel: string
  loading?: boolean
  multiple?: boolean
  /** Multi-select only: clears the whole selection (the "All" chip). */
  onClear?: () => void
}

export function ChipFilterGroup({
  items,
  value,
  onChange,
  ariaLabel,
  loading,
  multiple,
  onClear,
}: ChipFilterGroupProps) {
  const selected = Array.isArray(value) ? value : value ? [value] : []
  const isAllActive = selected.length === 0

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => (multiple ? onClear?.() : onChange(''))}
        aria-pressed={isAllActive}
        className={`font-mono text-[0.78rem] font-semibold rounded-full border px-[0.85rem] py-[0.4rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
          isAllActive
            ? 'border-[#3652E0] bg-[#3652E0] text-white dark:border-[#8493FF] dark:bg-[#8493FF] dark:text-[#14171A]'
            : 'border-[#DBDFD3] bg-white text-[#5B5F58] hover:border-[#8B8F86] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#A2A79C]'
        }`}
      >
        All
      </button>
      {!loading &&
        items.map((item) => {
          const isSelected = selected.includes(item.slug)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.slug)}
              aria-pressed={isSelected}
              className={`font-mono text-[0.78rem] font-semibold rounded-full border px-[0.85rem] py-[0.4rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
                isSelected
                  ? 'border-[#3652E0] bg-[#3652E0] text-white dark:border-[#8493FF] dark:bg-[#8493FF] dark:text-[#14171A]'
                  : `bg-white dark:bg-[#1C2024] ${getTagColorClasses(item.slug)}`
              }`}
            >
              {item.label}
            </button>
          )
        })}
    </div>
  )
}
