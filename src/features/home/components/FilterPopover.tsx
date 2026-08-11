import { useEffect, useRef, useState } from 'react'
import { FunnelSimple } from '@phosphor-icons/react'
import { useHomeData } from '@/features/home/context/useHomeData'
import { getI18nValue } from '@/shared/utils/i18n'
import { ChipFilterGroup } from './ChipFilterGroup'

interface FilterPopoverProps {
  category: string
  /** Comma-joined tag slugs (e.g. "quick,creative") — the filter supports
   *  selecting multiple tags, combined with OR semantics server/mock-side. */
  tag: string
  onCategoryChange: (slug: string) => void
  onTagChange: (slug: string) => void
  onClear: () => void
}

/** Single "Filters" trigger that groups Category + Tag into one popover panel,
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
  const { categories, categoriesLoaded, tags, tagsLoaded, ensureCategories, ensureTags } =
    useHomeData()
  const loading = !categoriesLoaded || !tagsLoaded
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void ensureCategories()
    void ensureTags()
  }, [ensureCategories, ensureTags])

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

  const tagSlugs = tag ? tag.split(',').filter(Boolean) : []

  function handleToggleTag(slug: string) {
    const next = tagSlugs.includes(slug)
      ? tagSlugs.filter((s) => s !== slug)
      : [...tagSlugs, slug]
    onTagChange(next.join(','))
  }

  const activeCount = (category ? 1 : 0) + tagSlugs.length

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
        Filters
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
                Category
              </span>
              <ChipFilterGroup
                items={categoryItems}
                value={category}
                onChange={onCategoryChange}
                ariaLabel="Filter by category"
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
                value={tagSlugs}
                onChange={handleToggleTag}
                onClear={() => onTagChange('')}
                ariaLabel="Filter by tag"
                multiple
              />
            </div>
          )}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="self-start font-mono text-[0.78rem] text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
