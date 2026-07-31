import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { getI18nValue } from '@/shared/utils/i18n'
import { createHistoryClient } from '../api/historyClient'
import { useHistoryFilters } from '../hooks/useHistoryFilters'
import { HistoryFilterBar } from '../components/HistoryFilterBar'
import { HistoryList } from '../components/HistoryList'
import { HistoryEmptyState } from '../components/HistoryEmptyState'
import { HistoryListSkeleton } from '../components/HistoryListSkeleton'
import type { HistoryListItem } from '../types'

const PAGE_SIZE = 20

export function HistoryPage() {
  const { session, isRestoring } = useAuth()
  const { filters, setTemplateId, setModel, setFrom, setTo, resetFilters } = useHistoryFilters()
  const historyClient = useMemo(() => createHistoryClient(session?.token), [session?.token])

  const [items, setItems] = useState<HistoryListItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestGeneration = useRef(0)

  const queryKey = useMemo(
    () => ({
      templateId: filters.templateId,
      model: filters.model,
      from: filters.from,
      to: filters.to,
    }),
    [filters.templateId, filters.model, filters.from, filters.to],
  )

  const loadData = useCallback(async () => {
    const generation = ++requestGeneration.current
    setLoading(true)
    setError(null)

    try {
      const result = await historyClient.list(queryKey, null, PAGE_SIZE)
      if (generation !== requestGeneration.current) return
      setItems(result.items)
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch {
      if (generation !== requestGeneration.current) return
      setError('Không thể tải lịch sử, vui lòng thử lại sau.')
    } finally {
      if (generation === requestGeneration.current) setLoading(false)
    }
  }, [historyClient, queryKey])

  useEffect(() => {
    if (!session) return
    void loadData()
  }, [session, loadData])

  const handleLoadMore = useCallback(async () => {
    const generation = requestGeneration.current
    if (!cursor) return
    setIsLoadingMore(true)
    try {
      const result = await historyClient.list(queryKey, cursor, PAGE_SIZE)
      if (generation !== requestGeneration.current) return
      setItems((prev) => [...prev, ...result.items])
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch {
      if (generation !== requestGeneration.current) return
      setError('Không thể tải thêm lịch sử, vui lòng thử lại sau.')
    } finally {
      if (generation === requestGeneration.current) setIsLoadingMore(false)
    }
  }, [historyClient, queryKey, cursor])

  const handleConfirmDelete = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      // Optimistic removal (FR-014/015/016) — treat an already-deleted
      // entry (e.g. removed by a concurrent session) as a no-op success,
      // not an error, per spec.md's Edge Cases.
      setItems((prev) => prev.filter((item) => !idSet.has(item.id)))
      void Promise.all(ids.map((id) => historyClient.remove(id).catch(() => {})))
    },
    [historyClient],
  )

  const templateOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const item of items) {
      if (item.templateId && !seen.has(item.templateId)) {
        seen.set(item.templateId, getI18nValue(item.templateTitle))
      }
    }
    return [...seen.entries()].map(([id, title]) => ({ id, title }))
  }, [items])

  const hasActiveFilters = Boolean(
    filters.templateId || filters.model || filters.from || filters.to,
  )

  if (isRestoring) return null
  if (!session) return <Navigate to="/login" replace />

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <div className="flex animate-[fade-slide-up_450ms_ease] flex-col gap-2">
        <span className="before:mr-1.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#3652E0] font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF] dark:before:bg-[#8493FF]">
          lịch sử
        </span>
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          Lịch sử prompt đã tạo
        </h1>
      </div>

      <HistoryFilterBar
        filters={filters}
        templateOptions={templateOptions}
        onTemplateChange={setTemplateId}
        onModelChange={setModel}
        onFromChange={setFrom}
        onToChange={setTo}
      />

      {error ? (
        <p className="m-0 text-[0.88rem] text-[#C23A2E] dark:text-[#FF7A6B]">{error}</p>
      ) : loading ? (
        <HistoryListSkeleton />
      ) : items.length === 0 ? (
        <HistoryEmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <HistoryList
          items={items}
          hasNext={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={() => void handleLoadMore()}
          getDetail={(id) => historyClient.get(id)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </main>
  )
}
