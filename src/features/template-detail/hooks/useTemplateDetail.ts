import { useEffect, useState } from 'react'
import { templateDetailClient } from '../api/templateDetailClient'
import type { TemplateDetail } from '../types'
import { ApiError } from '@/shared/utils/httpClient'
import { useAuth } from '@/features/auth/context/useAuth'

// Session-scoped cache (mirrors HomeDataProvider's ensureX() pattern) so
// revisiting the same template — e.g. Home -> detail -> Home -> detail —
// reuses the already-fetched data instead of re-fetching and re-incrementing
// the view count every time.
const detailCache = new Map<string, TemplateDetail>()
const inFlightRequests = new Map<string, Promise<TemplateDetail>>()

function cacheKey(id: string, accessToken?: string): string {
  return `${id}:${accessToken ? 'auth' : 'guest'}`
}

/** Test-only: reset the module-level cache between test cases. */
export function clearTemplateDetailCache(): void {
  detailCache.clear()
  inFlightRequests.clear()
}

export function useTemplateDetail(id: string) {
  const [template, setTemplate] = useState<TemplateDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const { session } = useAuth()

  useEffect(() => {
    let cancelled = false
    const key = cacheKey(id, session?.token)

    async function load() {
      setError(null)
      setNotFound(false)

      const cached = detailCache.get(key)
      if (cached) {
        setTemplate(cached)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        let pending = inFlightRequests.get(key)
        if (!pending) {
          pending = templateDetailClient.getDetail(id, session?.token)
          inFlightRequests.set(key, pending)
          pending.finally(() => inFlightRequests.delete(key))
        }
        const data = await pending
        if (!cancelled) {
          detailCache.set(key, data)
          setTemplate(data)
          // fire-and-forget view count increment (only on a real fetch, not a cache hit)
          templateDetailClient.incrementViewCount(id).catch(() => {})
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 404) {
            setNotFound(true)
          } else {
            setError('Không thể tải thông tin mẫu, vui lòng thử lại sau.')
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id, session?.token])

  return { template, isLoading, error, notFound }
}
