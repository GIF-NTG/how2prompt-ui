import { useEffect, useState } from 'react'
import { templateClient } from '@/features/home/api/templateClient'
import type { Category } from '@/features/home/types'
import { getI18nValue } from '@/shared/utils/i18n'
import { ChipFilterGroup } from './ChipFilterGroup'

interface CategoryFilterChipsProps {
  value: string
  onChange: (slug: string) => void
}

export function CategoryFilterChips({ value, onChange }: CategoryFilterChipsProps) {
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
    <ChipFilterGroup
      items={categories.map((c) => ({ id: c.id, slug: c.slug, label: getI18nValue(c.name) }))}
      value={value}
      onChange={onChange}
      ariaLabel="Lọc theo chủ đề"
      loading={loading}
    />
  )
}
