import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface CatalogFilterState {
  tag: string
  model: string
  search: string
}

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tag = searchParams.get('tag') ?? ''
  const model = searchParams.get('model') ?? ''
  const search = searchParams.get('q') ?? ''

  const setTag = useCallback(
    (slug: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (slug) {
            next.set('tag', slug)
          } else {
            next.delete('tag')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setModel = useCallback(
    (code: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (code) {
            next.set('model', code)
          } else {
            next.delete('model')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setSearch = useCallback(
    (query: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (query) {
            next.set('q', query)
          } else {
            next.delete('q')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  return {
    filters: { tag, model, search } as CatalogFilterState,
    setTag,
    setModel,
    setSearch,
    resetFilters,
  }
}
