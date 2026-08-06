import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

/** Client-side page controls for tables whose backend has no pagination
 *  params at all (categories, tags, AI models — verified against the real
 *  backend's live `/v3/api-docs`) — the full list is already fetched, this
 *  just windows it for display. `page` is 1-indexed. */
export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 pt-2 text-xs text-[#5B5F58] dark:text-[#A2A79C]"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex items-center gap-1 rounded-lg border border-[#DBDFD3] px-3 py-1.5 font-semibold disabled:opacity-40 dark:border-[#2C3130]"
      >
        <ChevronLeft size={14} /> Previous
      </button>
      <span className="font-mono">
        Page {page}/{pageCount}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className="flex items-center gap-1 rounded-lg border border-[#DBDFD3] px-3 py-1.5 font-semibold disabled:opacity-40 dark:border-[#2C3130]"
      >
        Next <ChevronRight size={14} />
      </button>
    </nav>
  )
}
