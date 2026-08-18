import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { createHistoryClient } from '../api/historyClient'
import { getHistoryDisplayTitle } from '../utils/displayTitle'
import type { HistoryFilters, HistoryListItem } from '../types'
import { HistoryDataContext } from './HistoryDataContext'

const PAGE_SIZE = 20
// Deliberately larger than PAGE_SIZE — this powers the "Filter by template"
// dropdown, which needs to see every distinct template the user has ever
// generated from, not just whatever fits on the first paginated page (see
// `templateOptions` doc in HistoryDataContext.ts).
const TEMPLATE_OPTIONS_SAMPLE_SIZE = 200

function serializeKey(filters: Partial<HistoryFilters>, accessToken?: string): string {
  return JSON.stringify({ ...filters, accessToken })
}

/** Lazily-fetched, cross-page cache for `HistoryPage`'s list — same pattern
 *  as `HomeDataProvider`'s `templates` cache: `ensureHistory` re-fetches
 *  only when the requested filters (or the signed-in session) differ from
 *  the last successfully-cached query, so navigating away from and back to
 *  `/history` (e.g. opening a history detail modal, or just via the top
 *  nav) reuses the cached list instead of re-fetching it. Mounted once at
 *  `RootLayout`, which doesn't unmount when the nested route changes.
 *
 *  A `latestRequestedKey` ref guards against a slow, now-stale request
 *  overwriting a faster, newer one (e.g. filters changed twice quickly) if
 *  it resolves later. */
export function HistoryDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const historyClient = useMemo(() => createHistoryClient(session?.token), [session?.token])

  const [items, setItems] = useState<HistoryListItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [templateOptions, setTemplateOptions] = useState<{ id: string; title: string }[]>([])

  const cachedKey = useRef<string | null>(null)
  const inFlight = useRef<{ key: string; promise: Promise<void> } | null>(null)
  const latestRequestedKey = useRef<string | null>(null)
  const lastFilters = useRef<Partial<HistoryFilters>>({})
  const templateOptionsLoadedFor = useRef<string | null>(null)
  const templateOptionsInFlight = useRef<Promise<void> | null>(null)

  const ensureHistory = useCallback(
    (filters: Partial<HistoryFilters>) => {
      const key = serializeKey(filters, session?.token)
      latestRequestedKey.current = key

      if (cachedKey.current === key) return Promise.resolve()
      if (inFlight.current?.key === key) return inFlight.current.promise

      const promise = historyClient
        .list(filters, null, PAGE_SIZE)
        .then((result) => {
          if (latestRequestedKey.current !== key) return
          setItems(result.items)
          setCursor(result.nextCursor)
          setHasMore(result.hasMore)
          setLoaded(true)
          cachedKey.current = key
          lastFilters.current = filters
        })
        .finally(() => {
          if (inFlight.current?.key === key) inFlight.current = null
        })

      inFlight.current = { key, promise }
      return promise
    },
    [historyClient, session?.token],
  )

  const loadMoreHistory = useCallback(async () => {
    if (!cursor) return
    const result = await historyClient.list(lastFilters.current, cursor, PAGE_SIZE)
    setItems((prev) => [...prev, ...result.items])
    setCursor(result.nextCursor)
    setHasMore(result.hasMore)
  }, [historyClient, cursor])

  // Cached per signed-in session (`session?.token`) rather than fetched once
  // ever — a different user (or a guest -> signed-in transition) must not
  // reuse the previous account's template list.
  const ensureTemplateOptions = useCallback(() => {
    const key = session?.token ?? ''
    if (templateOptionsLoadedFor.current === key) return Promise.resolve()
    if (!templateOptionsInFlight.current) {
      templateOptionsInFlight.current = historyClient
        .list({}, null, TEMPLATE_OPTIONS_SAMPLE_SIZE)
        .then((result) => {
          const seen = new Map<string, string>()
          for (const item of result.items) {
            if (item.templateId && !seen.has(item.templateId)) {
              seen.set(item.templateId, getHistoryDisplayTitle(item))
            }
          }
          setTemplateOptions([...seen.entries()].map(([id, title]) => ({ id, title })))
          templateOptionsLoadedFor.current = key
        })
        .finally(() => {
          templateOptionsInFlight.current = null
        })
    }
    return templateOptionsInFlight.current
  }, [historyClient, session?.token])

  const removeHistoryItems = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      setItems((prev) => prev.filter((item) => !idSet.has(item.id)))
      void Promise.all(ids.map((id) => historyClient.remove(id).catch(() => {})))
    },
    [historyClient],
  )

  const value = useMemo(
    () => ({
      items,
      cursor,
      hasMore,
      loaded,
      templateOptions,
      historyClient,
      ensureHistory,
      loadMoreHistory,
      ensureTemplateOptions,
      removeHistoryItems,
    }),
    [
      items,
      cursor,
      hasMore,
      loaded,
      templateOptions,
      historyClient,
      ensureHistory,
      loadMoreHistory,
      ensureTemplateOptions,
      removeHistoryItems,
    ],
  )

  return <HistoryDataContext.Provider value={value}>{children}</HistoryDataContext.Provider>
}
