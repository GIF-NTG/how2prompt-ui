import { MagnifyingGlass } from '@phosphor-icons/react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-[#DBDFD3] px-5 py-14 text-center dark:border-[#2C3130]">
      <MagnifyingGlass size={40} weight="duotone" color="#3652E0" aria-hidden="true" />
      <p className="m-0 text-[0.95rem] font-semibold text-[#1B1D1B] dark:text-[#ECEEE8]">
        No matching templates found
      </p>
      <p className="m-0 max-w-[36ch] text-[0.85rem] text-[#8B8F86] dark:text-[#6D726A]">
        Try a different keyword or remove some active filters.
      </p>
    </div>
  )
}
