import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { templateClient } from '../api/templateClient'
import type { Category, Tag, AiModel, TemplateListItem } from '../types'
import { HomeDataContext, type TemplatesQueryParams } from './HomeDataContext'

const PAGE_SIZE = 20

function serializeTemplatesKey(params: TemplatesQueryParams, accessToken?: string): string {
  return JSON.stringify({ ...params, accessToken })
}

/** Lazily-fetched, cross-page cache for Home's data — categories/tags/AI
 *  models (used by `FilterPopover`/`ModelFilter`), the featured/trending
 *  rails, and the main filtered template list. Nothing is fetched on mount:
 *  each resource is only requested the first time a consumer actually calls
 *  `ensureX()`. Once loaded, the result is cached for the lifetime of this
 *  provider (mounted once at `RootLayout`, which doesn't unmount when the
 *  nested route changes) so navigating away from and back to Home (e.g. to a
 *  template's detail page and back) reuses the same data instead of
 *  re-fetching it — same pattern as `AdminDataProvider`.
 *
 *  `templates` is the one resource that legitimately varies per visit (sort/
 *  search/category/tag/model), so it isn't a plain "fetch once" cache like
 *  the others: `ensureTemplates` re-fetches only when the requested params
 *  differ from the last successfully-cached query, keyed via
 *  `serializeTemplatesKey`. A `latestRequestedKey` ref guards against a
 *  slow, now-stale request (e.g. filter A) overwriting a faster, newer one
 *  (filter B) if it resolves later. */
export function HomeDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [tagsLoaded, setTagsLoaded] = useState(false)
  const [models, setModels] = useState<AiModel[]>([])
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [featured, setFeatured] = useState<TemplateListItem[]>([])
  const [featuredLoaded, setFeaturedLoaded] = useState(false)
  const [trending, setTrending] = useState<TemplateListItem[]>([])
  const [trendingLoaded, setTrendingLoaded] = useState(false)
  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const [templatesCursor, setTemplatesCursor] = useState<string | null>(null)
  const [templatesHasMore, setTemplatesHasMore] = useState(false)
  const [templatesLoaded, setTemplatesLoaded] = useState(false)

  const categoriesInFlight = useRef<Promise<void> | null>(null)
  const tagsInFlight = useRef<Promise<void> | null>(null)
  const modelsInFlight = useRef<Promise<void> | null>(null)
  const featuredInFlight = useRef<Promise<void> | null>(null)
  const trendingInFlight = useRef<Promise<void> | null>(null)
  const templatesInFlight = useRef<{ key: string; promise: Promise<void> } | null>(null)
  const templatesCachedKey = useRef<string | null>(null)
  const latestRequestedKey = useRef<string | null>(null)
  const templatesLastParams = useRef<{ params: TemplatesQueryParams; accessToken?: string } | null>(
    null,
  )

  const refetchCategories = useCallback(async () => {
    const result = await templateClient.getCategories()
    setCategories(Array.isArray(result) ? result : [])
    setCategoriesLoaded(true)
  }, [])

  const refetchTags = useCallback(async () => {
    const result = await templateClient.getTags()
    setTags(Array.isArray(result) ? result : [])
    setTagsLoaded(true)
  }, [])

  const refetchModels = useCallback(async () => {
    const result = await templateClient.getModels()
    setModels(Array.isArray(result) ? result : [])
    setModelsLoaded(true)
  }, [])

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

  const ensureFeatured = useCallback(
    (accessToken?: string) => {
      if (featuredLoaded) return Promise.resolve()
      if (!featuredInFlight.current) {
        // Featured/trending are supplementary rails — swallow a failure
        // (e.g. a not-yet-implemented backend endpoint) instead of blocking
        // or erroring the main template list, which is the page's core
        // functionality (mirrors the previous per-mount fetch's behavior).
        featuredInFlight.current = templateClient
          .getFeatured(accessToken)
          .catch(() => [])
          .then((result) => {
            setFeatured(Array.isArray(result) ? result : [])
            setFeaturedLoaded(true)
          })
          .finally(() => {
            featuredInFlight.current = null
          })
      }
      return featuredInFlight.current
    },
    [featuredLoaded],
  )

  const ensureTrending = useCallback(
    (accessToken?: string) => {
      if (trendingLoaded) return Promise.resolve()
      if (!trendingInFlight.current) {
        trendingInFlight.current = templateClient
          .getTrending(undefined, accessToken)
          .catch(() => [])
          .then((result) => {
            setTrending(Array.isArray(result) ? result : [])
            setTrendingLoaded(true)
          })
          .finally(() => {
            trendingInFlight.current = null
          })
      }
      return trendingInFlight.current
    },
    [trendingLoaded],
  )

  const ensureTemplates = useCallback((params: TemplatesQueryParams, accessToken?: string) => {
    const key = serializeTemplatesKey(params, accessToken)
    latestRequestedKey.current = key

    if (templatesCachedKey.current === key) return Promise.resolve()
    if (templatesInFlight.current?.key === key) return templatesInFlight.current.promise

    const promise = templateClient
      .getTemplates({ ...params, size: PAGE_SIZE }, accessToken)
      .then((page) => {
        // A newer request (different filters) may have superseded this one
        // while it was in flight — don't let a slow, stale response clobber
        // the fresher data already committed.
        if (latestRequestedKey.current !== key) return
        setTemplates(page.items)
        setTemplatesCursor(page.nextCursor)
        setTemplatesHasMore(page.hasMore)
        setTemplatesLoaded(true)
        templatesCachedKey.current = key
        templatesLastParams.current = { params, accessToken }
      })
      .finally(() => {
        if (templatesInFlight.current?.key === key) templatesInFlight.current = null
      })

    templatesInFlight.current = { key, promise }
    return promise
  }, [])

  const loadMoreTemplates = useCallback(async () => {
    const last = templatesLastParams.current
    if (!last || !templatesCursor) return
    const page = await templateClient.getTemplates(
      { ...last.params, size: PAGE_SIZE, cursor: templatesCursor },
      last.accessToken,
    )
    setTemplates((prev) => [...prev, ...page.items])
    setTemplatesCursor(page.nextCursor)
    setTemplatesHasMore(page.hasMore)
  }, [templatesCursor])

  const value = useMemo(
    () => ({
      categories,
      categoriesLoaded,
      tags,
      tagsLoaded,
      models,
      modelsLoaded,
      featured,
      featuredLoaded,
      trending,
      trendingLoaded,
      templates,
      templatesCursor,
      templatesHasMore,
      templatesLoaded,
      ensureCategories,
      ensureTags,
      ensureModels,
      ensureFeatured,
      ensureTrending,
      ensureTemplates,
      loadMoreTemplates,
    }),
    [
      categories,
      categoriesLoaded,
      tags,
      tagsLoaded,
      models,
      modelsLoaded,
      featured,
      featuredLoaded,
      trending,
      trendingLoaded,
      templates,
      templatesCursor,
      templatesHasMore,
      templatesLoaded,
      ensureCategories,
      ensureTags,
      ensureModels,
      ensureFeatured,
      ensureTrending,
      ensureTemplates,
      loadMoreTemplates,
    ],
  )

  return <HomeDataContext.Provider value={value}>{children}</HomeDataContext.Provider>
}
