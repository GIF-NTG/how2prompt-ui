import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { templateClient } from '@/features/home/api/templateClient'
import { useCatalogFilters } from '@/features/home/hooks/useCatalogFilters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { SearchBox } from '@/features/home/components/SearchBox'
import { FilterBar } from '@/features/home/components/FilterBar'
import { TemplateRail } from '@/features/home/components/TemplateRail'
import { TemplateGrid } from '@/features/home/components/TemplateGrid'
import { TemplateGridSkeleton } from '@/features/home/components/TemplateGridSkeleton'
import { EmptyState } from '@/features/home/components/EmptyState'
import type { TemplateListItem } from '@/features/home/types'

const PAGE_SIZE = 20

export function CatalogPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { filters, setCategory, setTag, setModel, setSearch, setSort, clearCategoryAndTag } =
    useCatalogFilters()
  const debouncedSearch = useDebounce(filters.search, 300)
  const [featured, setFeatured] = useState<TemplateListItem[]>([])
  const [trending, setTrending] = useState<TemplateListItem[]>([])
  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestGeneration = useRef(0)

  const queryKey = useMemo(
    () => ({
      model: filters.model,
      category: filters.category,
      tag: filters.tag,
      sort: filters.sort,
      q: debouncedSearch,
    }),
    [filters.model, filters.category, filters.tag, filters.sort, debouncedSearch],
  )

  const loadData = useCallback(async () => {
    const generation = ++requestGeneration.current
    setLoading(true)
    setError(null)

    try {
      // Featured/trending are supplementary rails — fetch them independently so a
      // failure there (e.g. a not-yet-implemented backend endpoint) doesn't block
      // the main template list, which is the page's core functionality.
      const [featuredResult, trendingResult, allData] = await Promise.all([
        templateClient.getFeatured(session?.token).catch(() => []),
        templateClient.getTrending(undefined, session?.token).catch(() => []),
        templateClient.getTemplates(
          {
            sort: queryKey.sort,
            size: PAGE_SIZE,
            q: queryKey.q || undefined,
            model: queryKey.model || undefined,
            category: queryKey.category || undefined,
            tags: queryKey.tag || undefined,
          },
          session?.token,
        ),
      ])

      if (generation !== requestGeneration.current) return
      setFeatured(featuredResult)
      setTrending(trendingResult)
      setTemplates(allData.items)
      setCursor(allData.nextCursor)
      setHasMore(allData.hasMore)
    } catch {
      if (generation !== requestGeneration.current) return
      setError('Không thể tải thư viện mẫu, vui lòng thử lại sau.')
    } finally {
      if (generation === requestGeneration.current) setLoading(false)
    }
  }, [queryKey, session?.token])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleLoadMore = useCallback(async () => {
    const generation = requestGeneration.current
    if (!cursor) return
    setIsLoadingMore(true)
    try {
      const allData = await templateClient.getTemplates(
        {
          sort: queryKey.sort,
          cursor,
          size: PAGE_SIZE,
          q: queryKey.q || undefined,
          model: queryKey.model || undefined,
          category: queryKey.category || undefined,
          tags: queryKey.tag || undefined,
        },
        session?.token,
      )
      if (generation !== requestGeneration.current) return
      setTemplates((prev) => [...prev, ...allData.items])
      setCursor(allData.nextCursor)
      setHasMore(allData.hasMore)
    } catch {
      if (generation !== requestGeneration.current) return
      setError('Không thể tải thêm mẫu, vui lòng thử lại sau.')
    } finally {
      if (generation === requestGeneration.current) setIsLoadingMore(false)
    }
  }, [cursor, queryKey, session?.token])

  const handleTemplateClick = useCallback(
    (id: string) => {
      navigate(`/templates/${id}`, { viewTransition: true })
    },
    [navigate],
  )

  const greeting = session
    ? `Chào ${session.displayName}, tìm mẫu prompt phù hợp`
    : 'Tìm mẫu prompt phù hợp — đăng nhập để lưu lịch sử'

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[0.88rem] text-[#C23A2A] dark:text-[#FF7A6B]">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <div className="flex animate-[fade-slide-up_450ms_ease] flex-col gap-2">
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          {greeting}
        </h1>
      </div>

      <div
        className="animate-[fade-slide-up_450ms_ease_backwards]"
        style={{ animationDelay: '80ms' }}
      >
        <FilterBar
          filters={filters}
          onModelChange={setModel}
          onCategoryChange={setCategory}
          onTagChange={setTag}
          onSortChange={setSort}
          onClearCategoryAndTag={clearCategoryAndTag}
          search={<SearchBox value={filters.search} onChange={setSearch} />}
        />
      </div>

      {loading && !error ? (
        <TemplateGridSkeleton />
      ) : templates.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <TemplateRail
            title="Nổi bật"
            subtitle="chọn bởi Admin"
            templates={featured}
            isSignedIn={!!session}
            onTemplateClick={handleTemplateClick}
          />

          <TemplateRail
            title="Thịnh hành 7 ngày qua"
            subtitle={trending.length > 0 ? `${trending.length} mẫu` : undefined}
            templates={trending}
            isSignedIn={!!session}
            onTemplateClick={handleTemplateClick}
          />

          <TemplateGrid
            templates={templates}
            isSignedIn={!!session}
            onTemplateClick={handleTemplateClick}
            hasNext={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void handleLoadMore()}
          />
        </>
      )}
    </main>
  )
}
