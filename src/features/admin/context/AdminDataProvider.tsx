import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { ApiError } from '@/shared/utils/httpClient'
import { createTaxonomyClient } from '../api/taxonomyClient'
import { createAiModelsClient } from '../api/aiModelsClient'
import type { Category, Tag } from '../api/taxonomyClient.types'
import type { AiModel } from '../api/aiModelsClient.types'
import { AdminDataContext } from './AdminDataContext'

/** Lazily-fetched, cross-page cache for categories/tags/AI models — Templates,
 *  Taxonomy, and AI Models all need this same reference data. Nothing is
 *  fetched on mount: each resource is only requested the first time a page
 *  actually calls `ensureX()` (e.g. visiting `/admin/dashboard` triggers no
 *  fetch at all here). Once loaded, the result is cached for the lifetime of
 *  this provider (mounted once at `AdminLayout`, which doesn't unmount when
 *  the nested route changes) so switching between e.g. Templates and
 *  Taxonomy reuses the same data instead of re-fetching it. */
export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const taxonomyClient = useMemo(() => createTaxonomyClient(session?.token), [session?.token])
  const aiModelsClient = useMemo(() => createAiModelsClient(session?.token), [session?.token])

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [tagsLoaded, setTagsLoaded] = useState(false)
  const [models, setModels] = useState<AiModel[]>([])
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoriesInFlight = useRef<Promise<void> | null>(null)
  const tagsInFlight = useRef<Promise<void> | null>(null)
  const modelsInFlight = useRef<Promise<void> | null>(null)

  const refetchCategories = useCallback(async () => {
    try {
      setCategories(await taxonomyClient.listCategories())
      setCategoriesLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải dữ liệu, vui lòng thử lại.')
      throw err
    }
  }, [taxonomyClient])

  const refetchTags = useCallback(async () => {
    try {
      setTags(await taxonomyClient.listTags())
      setTagsLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải dữ liệu, vui lòng thử lại.')
      throw err
    }
  }, [taxonomyClient])

  const refetchModels = useCallback(async () => {
    try {
      setModels(await aiModelsClient.list())
      setModelsLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải dữ liệu, vui lòng thử lại.')
      throw err
    }
  }, [aiModelsClient])

  const ensureCategories = useCallback(() => {
    if (categoriesLoaded) return Promise.resolve()
    if (!categoriesInFlight.current) {
      categoriesInFlight.current = refetchCategories().finally(() => {
        categoriesInFlight.current = null
      })
    }
    return categoriesInFlight.current
  }, [categoriesLoaded, refetchCategories])

  const ensureTags = useCallback(() => {
    if (tagsLoaded) return Promise.resolve()
    if (!tagsInFlight.current) {
      tagsInFlight.current = refetchTags().finally(() => {
        tagsInFlight.current = null
      })
    }
    return tagsInFlight.current
  }, [tagsLoaded, refetchTags])

  const ensureModels = useCallback(() => {
    if (modelsLoaded) return Promise.resolve()
    if (!modelsInFlight.current) {
      modelsInFlight.current = refetchModels().finally(() => {
        modelsInFlight.current = null
      })
    }
    return modelsInFlight.current
  }, [modelsLoaded, refetchModels])

  const value = useMemo(
    () => ({
      categories,
      categoriesLoaded,
      tags,
      tagsLoaded,
      models,
      modelsLoaded,
      error,
      taxonomyClient,
      aiModelsClient,
      ensureCategories,
      ensureTags,
      ensureModels,
      refetchCategories,
      refetchTags,
      refetchModels,
    }),
    [
      categories,
      categoriesLoaded,
      tags,
      tagsLoaded,
      models,
      modelsLoaded,
      error,
      taxonomyClient,
      aiModelsClient,
      ensureCategories,
      ensureTags,
      ensureModels,
      refetchCategories,
      refetchTags,
      refetchModels,
    ],
  )

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}
