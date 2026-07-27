import type { CatalogFilterState } from '@/features/home/hooks/useCatalogFilters'
import { ModelFilter } from './ModelFilter'
import { TagFilterChips } from './TagFilterChips'

interface FilterBarProps {
  filters: CatalogFilterState
  onModelChange: (code: string) => void
  onTagChange: (slug: string) => void
  search?: React.ReactNode
}

export function FilterBar({ filters, onModelChange, onTagChange, search }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-[0.85rem]">
      <div className="flex flex-wrap items-center gap-3">
        {search}
        <ModelFilter value={filters.model} onChange={onModelChange} />
      </div>
      <TagFilterChips value={filters.tag} onChange={onTagChange} />
    </div>
  )
}
