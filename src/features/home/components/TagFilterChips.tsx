import { useEffect, useState } from 'react'
import { templateClient } from '@/features/home/api/templateClient'
import type { Tag } from '@/features/home/types'
import { ChipFilterGroup } from './ChipFilterGroup'

interface TagFilterChipsProps {
  value: string
  onChange: (slug: string) => void
}

export function TagFilterChips({ value, onChange }: TagFilterChipsProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    templateClient.getTags().then((data) => {
      if (!cancelled) {
        setTags(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ChipFilterGroup
      items={tags.map((t) => ({ id: t.id, slug: t.slug, label: t.name }))}
      value={value}
      onChange={onChange}
      ariaLabel="Lọc theo tag"
      loading={loading}
    />
  )
}
