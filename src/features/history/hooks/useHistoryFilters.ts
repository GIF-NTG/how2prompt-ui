import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { HistoryFilters } from '../types'

export function useHistoryFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const templateId = searchParams.get('templateId') ?? ''
  const model = searchParams.get('model') ?? ''
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  const setFilterValue = useCallback(
    (key: keyof HistoryFilters, value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) {
            next.set(key, value)
          } else {
            next.delete(key)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setTemplateId = useCallback(
    (value: string) => setFilterValue('templateId', value),
    [setFilterValue],
  )
  const setModel = useCallback((value: string) => setFilterValue('model', value), [setFilterValue])
  const setFrom = useCallback((value: string) => setFilterValue('from', value), [setFilterValue])
  const setTo = useCallback((value: string) => setFilterValue('to', value), [setFilterValue])

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  return {
    filters: { templateId, model, from, to } as HistoryFilters,
    setTemplateId,
    setModel,
    setFrom,
    setTo,
    resetFilters,
  }
}
