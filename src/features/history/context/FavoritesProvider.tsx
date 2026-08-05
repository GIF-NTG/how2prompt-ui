import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { FavoritesContext } from './FavoritesContext'

function storageKey(accountId: string): string {
  return `how2prompt:favorites:v1:${accountId}`
}

function readIds(accountId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(accountId))
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function writeIds(accountId: string, ids: Set<string>): void {
  try {
    localStorage.setItem(storageKey(accountId), JSON.stringify([...ids]))
  } catch {
    // storage unavailable (private mode, quota) — cache just won't persist
  }
}

/**
 * The real backend's template list/detail responses don't include
 * `isFavorited` for the current user, and `GET /favorites` (the endpoint
 * docs/api/openapi.yaml documents for reading it back) 404s — it isn't
 * actually implemented server-side, same kind of gap as the missing admin
 * endpoints noted in CLAUDE.md. Toggling itself works
 * (POST/DELETE /templates/{id}/favorite), so this provider is the only
 * record of favorite state: it mirrors toggle results into localStorage,
 * scoped per account, so a refresh in the same browser doesn't lose them.
 * It does not sync across devices/browsers — there is no backend endpoint
 * to sync from.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIds(session ? readIds(session.accountId) : new Set())
  }, [session])

  const isFavorited = useCallback((templateId: string) => ids.has(templateId), [ids])

  const setFavorited = useCallback(
    (templateId: string, favorited: boolean) => {
      if (!session) return
      setIds((prev) => {
        const next = new Set(prev)
        if (favorited) {
          next.add(templateId)
        } else {
          next.delete(templateId)
        }
        writeIds(session.accountId, next)
        return next
      })
    },
    [session],
  )

  const value = useMemo(() => ({ isFavorited, setFavorited }), [isFavorited, setFavorited])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
