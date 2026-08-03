import { useEffect, useRef, useState } from 'react'
import { FunnelSimple } from '@phosphor-icons/react'
import { templateClient } from '@/features/home/api/templateClient'
import type { Category, Tag } from '@/features/home/types'
import { getI18nValue } from '@/shared/utils/i18n'
import { ChipFilterGroup } from './ChipFilterGroup'

interface FilterPopoverProps {
  category: string
  tag: string
  onCategoryChange: (slug: string) => void
  onTagChange: (slug: string) => void
  onClear: () => void
}

/** Single "Bộ lọc" trigger that groups Category + Tag into one popover panel,
 *  instead of two permanently-visible chip rows — keeps the filter bar to
 *  one line and scales once there are many categories/tags. Hidden entirely
 *  once loaded with nothing to filter by, same as the old chip rows. */
export function FilterPopover({
  category,
  tag,
  onCategoryChange,
  onTagChange,
  onClear,
}: FilterPopoverProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([templateClient.getCategories(), templateClient.getTags()]).then(
      ([categoriesResult, tagsResult]) => {
        if (cancelled) return
        setCategories(categoriesResult)
        setTags(tagsResult)
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  // Defends against a category/tag with no usable i18n label for the current
  // locale (e.g. a backend record missing `nameI18n.vi`/`en`) — render
  // nothing for it instead of an empty bordered chip.
  const categoryItems = categories
    .map((c) => ({ id: c.id, slug: c.slug, label: getI18nValue(c.name) }))
    .filter((c) => c.label)
  const tagItems = tags
    .map((t) => ({ id: t.id, slug: t.slug, label: t.name }))
    .filter((t) => t.label)

  if (!loading && categoryItems.length === 0 && tagItems.length === 0) return null

  const activeCount = (category ? 1 : 0) + (tag ? 1 : 0)

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 rounded-xl border px-[0.9rem] py-[0.62rem] text-[0.86rem] font-semibold transition-colors duration-150 ${
          activeCount > 0
            ? 'border-[#3652E0] bg-[#3652E0] text-white dark:border-[#8493FF] dark:bg-[#8493FF] dark:text-[#14171A]'
            : 'border-[#DBDFD3] bg-white text-[#1B1D1B] hover:border-[#8B8F86] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'
        }`}
      >
        <FunnelSimple size={16} weight="bold" aria-hidden="true" />
        Bộ lọc
        {activeCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white/25 px-1 font-mono text-[0.68rem]">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 flex w-[min(360px,90vw)] flex-col gap-4 rounded-xl border border-[#DBDFD3] bg-white p-4 shadow-lg dark:border-[#2C3130] dark:bg-[#1C2024]">
          {categoryItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#8B8F86] dark:text-[#6D726A]">
                Chủ đề
              </span>
              <ChipFilterGroup
                items={categoryItems}
                value={category}
                onChange={onCategoryChange}
                ariaLabel="Lọc theo chủ đề"
              />
            </div>
          )}

          {tagItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#8B8F86] dark:text-[#6D726A]">
                Tag
              </span>
              <ChipFilterGroup
                items={tagItems}
                value={tag}
                onChange={onTagChange}
                ariaLabel="Lọc theo tag"
              />
            </div>
          )}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="self-start font-mono text-[0.78rem] text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  )
}
