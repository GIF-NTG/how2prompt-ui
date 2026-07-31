import { useEffect, useState } from 'react'
import { templateDetailClient } from '../api/templateDetailClient'
import type { TemplateDetail } from '../types'
import { ApiError } from '@/shared/utils/httpClient'

export function useTemplateDetail(id: string) {
  const [template, setTemplate] = useState<TemplateDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const data = await templateDetailClient.getDetail(id)
        if (!cancelled) {
          setTemplate(data)
          // fire-and-forget view count increment
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
  }, [id])

  return { template, isLoading, error, notFound }
}
