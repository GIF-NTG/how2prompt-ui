import { useMemo, useState } from 'react'

/** Windows an already-fetched in-memory array into pages — for tables backed
 *  by endpoints with no server-side pagination (categories, tags, AI
 *  models). Resets to page 1 whenever the item count changes (new item
 *  created/deleted) so the current page can't point past the end.
 *
 *  The reset is done during render (React's documented pattern for
 *  adjusting state from a prop change) rather than in a `useEffect`, which
 *  would commit the stale page first and force an extra render. */
export function usePagedItems<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)
  const [prevLength, setPrevLength] = useState(items.length)

  if (items.length !== prevLength) {
    setPrevLength(items.length)
    setPage(1)
  }

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  )

  return { page: safePage, pageCount, setPage, pageItems }
}
