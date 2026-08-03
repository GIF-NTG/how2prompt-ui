import type { CatalogFilterState, CatalogSort } from '@/features/home/hooks/useCatalogFilters'
import { ModelFilter } from './ModelFilter'
import { FilterPopover } from './FilterPopover'

interface FilterBarProps {
  filters: CatalogFilterState
  onModelChange: (code: string) => void
  onCategoryChange: (slug: string) => void
  onTagChange: (slug: string) => void
  onSortChange: (value: CatalogSort) => void
  onClearCategoryAndTag: () => void
  search?: React.ReactNode
}

export function FilterBar({
  filters,
  onModelChange,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onClearCategoryAndTag,
  search,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {search}
      <ModelFilter value={filters.model} onChange={onModelChange} />
      <select
        aria-label="Sắp xếp theo"
        value={filters.sort}
        onChange={(e) => onSortChange(e.target.value as CatalogSort)}
        className="font-[inherit] cursor-pointer rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]"
      >
        <option value="popular">Phổ biến nhất</option>
        <option value="newest">Mới nhất</option>
      </select>
      <FilterPopover
        category={filters.category}
        tag={filters.tag}
        onCategoryChange={onCategoryChange}
        onTagChange={onTagChange}
        onClear={onClearCategoryAndTag}
      />
    </div>
  )
}
