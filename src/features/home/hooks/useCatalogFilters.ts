import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export type CatalogSort = 'popular' | 'newest'

export interface CatalogFilterState {
  category: string
  tag: string
  model: string
  search: string
  sort: CatalogSort
}

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') ?? ''
  const tag = searchParams.get('tag') ?? ''
  const model = searchParams.get('model') ?? ''
  const search = searchParams.get('q') ?? ''
  const sort: CatalogSort = searchParams.get('sort') === 'newest' ? 'newest' : 'popular'

  const setCategory = useCallback(
    (slug: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (slug) {
            next.set('category', slug)
          } else {
            next.delete('category')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

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

  const setSort = useCallback(
    (value: CatalogSort) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value && value !== 'popular') {
            next.set('sort', value)
          } else {
            next.delete('sort')
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

  // Clears category + tag together in one `setSearchParams` call — calling
  // `setCategory('')` then `setTag('')` back to back doesn't compose: each
  // reads the same pre-update `searchParams` snapshot (react-router only
  // refreshes it on the next render, not synchronously), so the second call
  // clobbers the first instead of building on it and one filter stays applied.
  const clearCategoryAndTag = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('category')
        next.delete('tag')
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  return {
    filters: { category, tag, model, search, sort } as CatalogFilterState,
    setCategory,
    setTag,
    setModel,
    setSearch,
    setSort,
    resetFilters,
    clearCategoryAndTag,
  }
}
