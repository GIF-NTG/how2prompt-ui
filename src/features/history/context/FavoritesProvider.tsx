import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { createHistoryClient } from '../api/historyClient'
import { FavoritesContext } from './FavoritesContext'

const PAGE_SIZE = 100
// Safety cap on how many pages we'll walk to build the favorite-id set — a
// user with more than this many favorites is not a case worth optimizing for.
const MAX_PAGES = 20

/**
 * The real backend's template list/detail responses don't include
 * `isFavorited` for the current user (see the drift notes in
 * templateClient.real.ts / templateDetailClient.real.ts) — it's always
 * missing, not just unauthenticated, so every reload showed favorited
 * templates as unfavorited again even though the toggle succeeded
 * server-side. `/favorites` is the only endpoint that reliably reports
 * favorite state, so this provider walks it once per session into a local id
 * set that TemplateCard/TemplateMeta consult instead of trusting the
 * (missing) field on list/detail responses.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const historyClient = useMemo(() => createHistoryClient(session?.token), [session?.token])
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!session) {
      setIds(new Set())
      return
    }

    let cancelled = false

    async function loadAll() {
      const collected = new Set<string>()
      let cursor: string | null = null
      let hasMore = true
      let pages = 0
      while (hasMore && pages < MAX_PAGES && !cancelled) {
        const page = await historyClient.listFavorites(cursor, PAGE_SIZE)
        for (const t of page.items) collected.add(t.id)
        cursor = page.nextCursor
        hasMore = page.hasMore
        pages += 1
      }
      if (!cancelled) {
        setIds(collected)
      }
    }

    loadAll().catch(() => {})
    return () => {
      cancelled = true
    }
  }, [session, historyClient])

  const isFavorited = useCallback((templateId: string) => ids.has(templateId), [ids])

  const setFavorited = useCallback((templateId: string, favorited: boolean) => {
    setIds((prev) => {
      const next = new Set(prev)
      if (favorited) {
        next.add(templateId)
      } else {
        next.delete(templateId)
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ isFavorited, setFavorited }), [isFavorited, setFavorited])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
