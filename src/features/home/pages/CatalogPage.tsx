import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { templateClient } from '@/features/home/api/templateClient'
import { useCatalogFilters } from '@/features/home/hooks/useCatalogFilters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { SearchBox } from '@/features/home/components/SearchBox'
import { FilterBar } from '@/features/home/components/FilterBar'
import { TemplateRail } from '@/features/home/components/TemplateRail'
import { TemplateGrid } from '@/features/home/components/TemplateGrid'
import { EmptyState } from '@/features/home/components/EmptyState'
import type { TemplateListItem } from '@/features/home/types'

export function CatalogPage() {
  const { session } = useAuth()
  const { filters, setTag, setModel, setSearch } = useCatalogFilters()
  const debouncedSearch = useDebounce(filters.search, 300)
  const [featured, setFeatured] = useState<TemplateListItem[]>([])
  const [trending, setTrending] = useState<TemplateListItem[]>([])
  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const queryKey = useMemo(
    () => ({ model: filters.model, tag: filters.tag, q: debouncedSearch }),
    [filters.model, filters.tag, debouncedSearch],
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [featuredData, trendingData, allData] = await Promise.all([
        templateClient.getFeatured(),
        templateClient.getTrending(),
        templateClient.getTemplates({
          sort: 'popular',
          limit: 50,
          q: queryKey.q || undefined,
          model: queryKey.model || undefined,
          tags: queryKey.tag || undefined,
        }),
      ])

      setFeatured(featuredData)
      setTrending(trendingData)
      setTemplates(allData.data)
      setTotalCount(allData.total_count)
    } catch {
      setError('Không thể tải thư viện mẫu, vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [queryKey])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const greeting = session
    ? `Chào ${session.displayName}, tìm mẫu prompt phù hợp`
    : 'Tìm mẫu prompt phù hợp — đăng nhập để lưu lịch sử'

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF]">
            templates · guest & member
          </span>
          <p className="m-0 text-[0.88rem] text-[#C23A2A] dark:text-[#FF7A6B]">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <div className="flex flex-col gap-2">
        <span className="before:mr-1.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#3652E0] font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF] dark:before:bg-[#8493FF]">
          templates · guest & member
        </span>
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          {greeting}
        </h1>
        <p className="m-0 max-w-[62ch] text-[0.94rem] leading-[1.6] text-[#5B5F58] dark:text-[#A2A79C]">
          Duyệt theo chủ đề, model AI, hoặc tìm theo từ khóa — chọn một mẫu để điền vào các ô đã
          định nghĩa sẵn.
        </p>
      </div>

      <FilterBar
        filters={filters}
        onModelChange={setModel}
        onTagChange={setTag}
        search={<SearchBox value={filters.search} onChange={setSearch} />}
      />

      {loading && !error ? (
        <p className="text-[0.88rem] text-[#8B8F86] dark:text-[#6D726A]">Đang tải...</p>
      ) : templates.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <TemplateRail
            title="Nổi bật"
            subtitle="chọn bởi Admin"
            templates={featured}
            isSignedIn={!!session}
          />

          <TemplateRail
            title="Thịnh hành 7 ngày qua"
            subtitle={trending.length > 0 ? `${trending.length} mẫu` : undefined}
            templates={trending}
            isSignedIn={!!session}
          />

          <TemplateGrid templates={templates} totalCount={totalCount} isSignedIn={!!session} />
        </>
      )}
    </main>
  )
}
