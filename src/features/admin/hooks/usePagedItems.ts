import { useEffect, useMemo, useState } from 'react'

/** Windows an already-fetched in-memory array into pages — for tables backed
 *  by endpoints with no server-side pagination (categories, tags, AI
 *  models). Resets to page 1 whenever the item count changes (new item
 *  created/deleted) so the current page can't point past the end. */
export function usePagedItems<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [items.length])

  const safePage = Math.min(page, pageCount)
  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  )

  return { page: safePage, pageCount, setPage, pageItems }
}
