import { Heart } from 'lucide-react'
import type { CatalogFilterState, CatalogSort } from '@/features/home/hooks/useCatalogFilters'
import { SelectMenu } from '@/shared/components/SelectMenu'
import { ModelFilter } from './ModelFilter'
import { FilterPopover } from './FilterPopover'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest' },
]

interface FilterBarProps {
  filters: CatalogFilterState
  onModelChange: (code: string) => void
  onCategoryChange: (slug: string) => void
  onTagChange: (slug: string) => void
  onSortChange: (value: CatalogSort) => void
  onFavoritesOnlyChange: (value: boolean) => void
  onClearCategoryAndTag: () => void
  /** Hides the Favorites filter for Guests — favoriting requires an account. */
  isSignedIn: boolean
  search?: React.ReactNode
}

export function FilterBar({
  filters,
  onModelChange,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onFavoritesOnlyChange,
  onClearCategoryAndTag,
  isSignedIn,
  search,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {search}
      <ModelFilter value={filters.model} onChange={onModelChange} />
      <SelectMenu
        value={filters.sort}
        options={SORT_OPTIONS}
        onChange={(v) => onSortChange(v as CatalogSort)}
        ariaLabel="Sort by"
      />
      <FilterPopover
        category={filters.category}
        tag={filters.tag}
        onCategoryChange={onCategoryChange}
        onTagChange={onTagChange}
        onClear={onClearCategoryAndTag}
      />
      {isSignedIn && (
        <button
          type="button"
          onClick={() => onFavoritesOnlyChange(!filters.favoritesOnly)}
          aria-pressed={filters.favoritesOnly}
          className={`flex items-center gap-1.5 rounded-xl border px-[0.9rem] py-[0.62rem] text-[0.86rem] font-semibold transition-colors duration-150 ${
            filters.favoritesOnly
              ? 'border-[#C23A2E] bg-[#C23A2E] text-white dark:border-[#FF7A6B] dark:bg-[#FF7A6B] dark:text-[#14171A]'
              : 'border-[#DBDFD3] bg-white text-[#1B1D1B] hover:border-[#8B8F86] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'
          }`}
        >
          <Heart
            aria-hidden="true"
            size={16}
            fill={filters.favoritesOnly ? 'currentColor' : 'none'}
          />
          Favorites
        </button>
      )}
    </div>
  )
}
