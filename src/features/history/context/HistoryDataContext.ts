import { createContext } from 'react'
import type { HistoryClient } from '../api/historyClient.types'
import type { HistoryFilters, HistoryListItem } from '../types'

export interface HistoryDataContextValue {
  items: HistoryListItem[]
  cursor: string | null
  hasMore: boolean
  /** True once a request has resolved for the *current* `items` — flips
   *  false again while a new filter query is loading (see `ensureHistory`). */
  loaded: boolean
  /** Distinct templates seen across a large, unfiltered sample of the
   *  user's history — for the "Filter by template" dropdown. Deliberately
   *  NOT derived from `items`: `items` is both paginated (20/page) and
   *  narrowed by whatever filters are currently active, so a dropdown built
   *  from it would only ever list the templates visible on the current
   *  page/filter instead of every template the user has ever generated
   *  from. */
  templateOptions: { id: string; title: string }[]
  historyClient: HistoryClient
  /** Re-fetches only when `filters` (or the signed-in session) differ from
   *  the last successfully-cached query — revisiting History with the same
   *  filters reuses the cached list instead of re-fetching. */
  ensureHistory: (filters: Partial<HistoryFilters>) => Promise<void>
  /** Appends the next cursor page onto the cached list for the last query. */
  loadMoreHistory: () => Promise<void>
  /** Fetches `templateOptions` once per session (per signed-in user) — see
   *  its doc above for why this is a separate request from `ensureHistory`. */
  ensureTemplateOptions: () => Promise<void>
  /** Optimistically removes `ids` from the cache and fires the backend
   *  delete for each — same pattern `HistoryPage` used locally before. */
  removeHistoryItems: (ids: string[]) => void
}

export const HistoryDataContext = createContext<HistoryDataContextValue | null>(null)
