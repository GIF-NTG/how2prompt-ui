import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { ApiError } from '@/shared/utils/httpClient'
import { createTaxonomyClient } from '../api/taxonomyClient'
import { createAiModelsClient } from '../api/aiModelsClient'
import { createDashboardClient } from '../api/dashboardClient'
import { createTemplatesAdminClient } from '../api/templatesAdminClient'
import type { Category, Tag } from '../api/taxonomyClient.types'
import type { AiModel } from '../api/aiModelsClient.types'
import type { DashboardMetricSnapshot } from '../api/dashboardClient.types'
import type { AdminTemplate } from '../api/templatesAdminClient.types'
import { AdminDataContext } from './AdminDataContext'

/** Lazily-fetched, cross-page cache for categories/tags/AI models/dashboard
 *  stats/templates. Nothing is fetched on mount: each resource is only
 *  requested the first time a page actually calls `ensureX()`. Once loaded,
 *  the result is cached for the lifetime of this provider (mounted once at
 *  `AdminLayout`, which doesn't unmount when the nested route changes) so
 *  navigating away from and back to e.g. `/admin/dashboard` or
 *  `/admin/templates` reuses the same data instead of re-fetching it. */
export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const taxonomyClient = useMemo(() => createTaxonomyClient(session?.token), [session?.token])
  const aiModelsClient = useMemo(() => createAiModelsClient(session?.token), [session?.token])
  const dashboardClient = useMemo(() => createDashboardClient(session?.token), [session?.token])
  const templatesAdminClient = useMemo(
    () => createTemplatesAdminClient(session?.token),
    [session?.token],
  )

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [tagsLoaded, setTagsLoaded] = useState(false)
  const [models, setModels] = useState<AiModel[]>([])
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardMetricSnapshot | null>(null)
  const [dashboardStatsLoaded, setDashboardStatsLoaded] = useState(false)
  const [templates, setTemplates] = useState<AdminTemplate[]>([])
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const [templatesCursor, setTemplatesCursor] = useState<string | null>(null)
  const [templatesHasMore, setTemplatesHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoriesInFlight = useRef<Promise<void> | null>(null)
  const tagsInFlight = useRef<Promise<void> | null>(null)
  const modelsInFlight = useRef<Promise<void> | null>(null)
  const dashboardStatsInFlight = useRef<Promise<void> | null>(null)
  const templatesInFlight = useRef<Promise<void> | null>(null)

  const refetchCategories = useCallback(async () => {
    try {
      setCategories(await taxonomyClient.listCategories())
      setCategoriesLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load data, please try again.')
      throw err
    }
  }, [taxonomyClient])

  const refetchTags = useCallback(async () => {
    try {
      setTags(await taxonomyClient.listTags())
      setTagsLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load data, please try again.')
      throw err
    }
  }, [taxonomyClient])

  const refetchModels = useCallback(async () => {
    try {
      setModels(await aiModelsClient.list())
      setModelsLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load data, please try again.')
      throw err
    }
  }, [aiModelsClient])

  const refetchDashboardStats = useCallback(async () => {
    try {
      setDashboardStats(await dashboardClient.getStats())
      setDashboardStatsLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load data, please try again.')
      throw err
    }
  }, [dashboardClient])

  const refetchTemplates = useCallback(async () => {
    try {
      const page = await templatesAdminClient.list()
      setTemplates(page.items)
      setTemplatesCursor(page.nextCursor)
      setTemplatesHasMore(page.hasMore)
      setTemplatesLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load data, please try again.')
      throw err
    }
  }, [templatesAdminClient])

  const loadMoreTemplates = useCallback(async () => {
    if (!templatesCursor) return
    try {
      const page = await templatesAdminClient.list(templatesCursor)
      setTemplates((prev) => [...prev, ...page.items])
      setTemplatesCursor(page.nextCursor)
      setTemplatesHasMore(page.hasMore)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to load more templates, please try again.',
      )
      throw err
    }
  }, [templatesAdminClient, templatesCursor])

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

  const ensureDashboardStats = useCallback(() => {
    if (dashboardStatsLoaded) return Promise.resolve()
    if (!dashboardStatsInFlight.current) {
      dashboardStatsInFlight.current = refetchDashboardStats().finally(() => {
        dashboardStatsInFlight.current = null
      })
    }
    return dashboardStatsInFlight.current
  }, [dashboardStatsLoaded, refetchDashboardStats])

  const ensureTemplates = useCallback(() => {
    if (templatesLoaded) return Promise.resolve()
    if (!templatesInFlight.current) {
      templatesInFlight.current = refetchTemplates().finally(() => {
        templatesInFlight.current = null
      })
    }
    return templatesInFlight.current
  }, [templatesLoaded, refetchTemplates])

  const value = useMemo(
    () => ({
      categories,
      categoriesLoaded,
      tags,
      tagsLoaded,
      models,
      modelsLoaded,
      dashboardStats,
      dashboardStatsLoaded,
      templates,
      templatesLoaded,
      templatesCursor,
      templatesHasMore,
      error,
      taxonomyClient,
      aiModelsClient,
      dashboardClient,
      templatesAdminClient,
      ensureCategories,
      ensureTags,
      ensureModels,
      ensureDashboardStats,
      ensureTemplates,
      refetchCategories,
      refetchTags,
      refetchModels,
      refetchDashboardStats,
      refetchTemplates,
      loadMoreTemplates,
    }),
    [
      categories,
      categoriesLoaded,
      tags,
      tagsLoaded,
      models,
      modelsLoaded,
      dashboardStats,
      dashboardStatsLoaded,
      templates,
      templatesLoaded,
      templatesCursor,
      templatesHasMore,
      error,
      taxonomyClient,
      aiModelsClient,
      dashboardClient,
      templatesAdminClient,
      ensureCategories,
      ensureTags,
      ensureModels,
      ensureDashboardStats,
      ensureTemplates,
      refetchCategories,
      refetchTags,
      refetchModels,
      refetchDashboardStats,
      refetchTemplates,
      loadMoreTemplates,
    ],
  )

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}
