import { Link } from 'react-router-dom'
import { ClockCounterClockwise, MagnifyingGlass } from '@phosphor-icons/react'

interface HistoryEmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters?: () => void
}

export function HistoryEmptyState({ hasActiveFilters, onClearFilters }: HistoryEmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-[#DBDFD3] px-5 py-14 text-center dark:border-[#2C3130]">
        <MagnifyingGlass size={40} weight="duotone" color="#C98A1F" aria-hidden="true" />
        <p className="m-0 text-[0.95rem] font-semibold text-[#1B1D1B] dark:text-[#ECEEE8]">
          No results match your filters
        </p>
        <p className="m-0 max-w-[36ch] text-[0.85rem] text-[#8B8F86] dark:text-[#6D726A]">
          Try removing some active filter conditions.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-1 cursor-pointer rounded-panel border border-[#DBDFD3] bg-transparent px-4 py-2 text-[0.85rem] font-semibold text-[#1B1D1B] transition-colors duration-150 hover:border-[#8B8F86] hover:bg-[#EAEDE6] dark:border-[#2C3130] dark:text-[#ECEEE8] dark:hover:border-[#6D726A] dark:hover:bg-[#23282C]"
          >
            Clear filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-[#DBDFD3] px-5 py-14 text-center dark:border-[#2C3130]">
      <ClockCounterClockwise size={40} weight="duotone" color="#3652E0" aria-hidden="true" />
      <p className="m-0 text-[0.95rem] font-semibold text-[#1B1D1B] dark:text-[#ECEEE8]">
        You haven&apos;t generated any prompts yet
      </p>
      <p className="m-0 max-w-[36ch] text-[0.85rem] text-[#8B8F86] dark:text-[#6D726A]">
        Browse the template library to create your first prompt.
      </p>
      <Link
        to="/"
        className="mt-1 rounded-panel border border-[#DBDFD3] bg-transparent px-4 py-2 text-[0.85rem] font-semibold text-[#1B1D1B] transition-colors duration-150 hover:border-[#8B8F86] hover:bg-[#EAEDE6] dark:border-[#2C3130] dark:text-[#ECEEE8] dark:hover:border-[#6D726A] dark:hover:bg-[#23282C]"
      >
        Browse template library
      </Link>
    </div>
  )
}
