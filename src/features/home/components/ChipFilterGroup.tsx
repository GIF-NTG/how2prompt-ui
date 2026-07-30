import { getTagColorClasses } from '@/shared/utils/colorTag'

interface ChipFilterGroupProps {
  items: { id: string; slug: string; label: string }[]
  value: string
  onChange: (slug: string) => void
  ariaLabel: string
  loading?: boolean
}

export function ChipFilterGroup({
  items,
  value,
  onChange,
  ariaLabel,
  loading,
}: ChipFilterGroupProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => onChange('')}
        aria-pressed={!value}
        className={`font-mono text-[0.78rem] font-semibold rounded-full border px-[0.85rem] py-[0.4rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
          !value
            ? 'border-[#3652E0] bg-[#3652E0] text-white dark:border-[#8493FF] dark:bg-[#8493FF] dark:text-[#14171A]'
            : 'border-[#DBDFD3] bg-white text-[#5B5F58] hover:border-[#8B8F86] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#A2A79C]'
        }`}
      >
        Tất cả
      </button>
      {!loading &&
        items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.slug)}
            aria-pressed={value === item.slug}
            className={`font-mono text-[0.78rem] font-semibold rounded-full border bg-white px-[0.85rem] py-[0.4rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:bg-[#1C2024] ${
              value === item.slug
                ? 'border-[#3652E0] bg-[#3652E0] text-white dark:border-[#8493FF] dark:bg-[#8493FF] dark:text-[#14171A]'
                : getTagColorClasses(item.slug)
            }`}
          >
            {item.label}
          </button>
        ))}
    </div>
  )
}
