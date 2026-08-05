import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { useHomeData } from '@/features/home/context/useHomeData'
import { useCatalogFilters } from '@/features/home/hooks/useCatalogFilters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { SearchBox } from '@/features/home/components/SearchBox'
import { FeaturedTemplateHero } from '@/features/home/components/FeaturedTemplateHero'
import { FilterBar } from '@/features/home/components/FilterBar'
import { TemplateRail } from '@/features/home/components/TemplateRail'
import { TemplateGrid } from '@/features/home/components/TemplateGrid'
import { TemplateGridSkeleton } from '@/features/home/components/TemplateGridSkeleton'
import { EmptyState } from '@/features/home/components/EmptyState'

export function CatalogPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { filters, setCategory, setTag, setModel, setSearch, setSort, clearCategoryAndTag } =
    useCatalogFilters()
  const debouncedSearch = useDebounce(filters.search, 300)
  // Featured/trending/templates are shared, lazily-fetched, cross-page state
  // (see HomeDataProvider) — `ensureX()` only re-fetches templates when the
  // filter params actually change, so navigating away from and back to Home
  // (e.g. to a template's detail page) reuses the cached data instead of
  // re-fetching everything.
  const {
    featured,
    trending,
    templates,
    templatesCursor,
    templatesHasMore,
    ensureFeatured,
    ensureTrending,
    ensureTemplates,
    loadMoreTemplates,
  } = useHomeData()
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const templatesParams = useMemo(
    () => ({
      sort: filters.sort,
      q: debouncedSearch || undefined,
      model: filters.model || undefined,
      category: filters.category || undefined,
      tags: filters.tag || undefined,
    }),
    [filters.sort, debouncedSearch, filters.model, filters.category, filters.tag],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    void ensureFeatured(session?.token)
    void ensureTrending(session?.token)
    ensureTemplates(templatesParams, session?.token)
      .catch(() => {
        if (!cancelled) setError('Không thể tải thư viện mẫu, vui lòng thử lại sau.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [templatesParams, session?.token, ensureFeatured, ensureTrending, ensureTemplates])

  const handleLoadMore = useCallback(async () => {
    if (!templatesCursor) return
    setIsLoadingMore(true)
    try {
      await loadMoreTemplates()
    } catch {
      setError('Không thể tải thêm mẫu, vui lòng thử lại sau.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [templatesCursor, loadMoreTemplates])

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
        style={{ animationDelay: '60ms' }}
      >
        <FeaturedTemplateHero />
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
            hasNext={templatesHasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void handleLoadMore()}
          />
        </>
      )}
    </main>
  )
}
