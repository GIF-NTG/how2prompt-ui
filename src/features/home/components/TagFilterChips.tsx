import { useEffect, useState } from 'react'
import { templateClient } from '@/features/home/api/templateClient'
import type { Category } from '@/features/home/types'
import { getI18nValue } from '@/shared/utils/i18n'

interface TagFilterChipsProps {
  value: string
  onChange: (slug: string) => void
}

export function TagFilterChips({ value, onChange }: TagFilterChipsProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    templateClient.getCategories().then((data) => {
      if (!cancelled) {
        setCategories(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo chủ đề">
      <button
        type="button"
        onClick={() => onChange('')}
        className={`font-mono text-[0.78rem] font-semibold rounded-full border px-[0.85rem] py-[0.4rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
          !value
            ? 'border-[#3652E0] bg-[#3652E0] text-white dark:border-[#8493FF] dark:bg-[#8493FF] dark:text-[#14171A]'
            : 'border-[#DBDFD3] bg-white text-[#5B5F58] hover:border-[#8B8F86] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#A2A79C]'
        }`}
      >
        Tất cả
      </button>
      {!loading &&
        categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.slug)}
            className={`font-mono text-[0.78rem] font-semibold rounded-full border px-[0.85rem] py-[0.4rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
              value === cat.slug
                ? 'border-[#3652E0] bg-[#3652E0] text-white dark:border-[#8493FF] dark:bg-[#8493FF] dark:text-[#14171A]'
                : 'border-[#DBDFD3] bg-white text-[#5B5F58] hover:border-[#8B8F86] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#A2A79C]'
            }`}
          >
            {getI18nValue(cat.name)}
          </button>
        ))}
    </div>
  )
}
