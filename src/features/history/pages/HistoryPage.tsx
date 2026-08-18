import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { useHistoryData } from '../context/useHistoryData'
import { useHistoryFilters } from '../hooks/useHistoryFilters'
import { HistoryFilterBar } from '../components/HistoryFilterBar'
import { HistoryList } from '../components/HistoryList'
import { HistoryEmptyState } from '../components/HistoryEmptyState'
import { HistoryListSkeleton } from '../components/HistoryListSkeleton'

export function HistoryPage() {
  const { session, isRestoring } = useAuth()
  const { filters, setTemplateId, setModel, setFrom, setTo, resetFilters } = useHistoryFilters()
  // History list is shared, lazily-fetched, cross-page state (see
  // HistoryDataProvider) — `ensureHistory()` only re-fetches when the
  // filters actually change, so navigating away from and back to History
  // reuses the cached data instead of re-fetching it.
  const {
    items,
    cursor,
    hasMore,
    templateOptions,
    historyClient,
    ensureHistory,
    loadMoreHistory,
    ensureTemplateOptions,
    removeHistoryItems,
  } = useHistoryData()

  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const queryKey = useMemo(
    () => ({
      templateId: filters.templateId,
      model: filters.model,
      from: filters.from,
      to: filters.to,
    }),
    [filters.templateId, filters.model, filters.from, filters.to],
  )

  useEffect(() => {
    if (!session) return
    let cancelled = false
    setLoading(true)
    setError(null)
    ensureHistory(queryKey)
      .catch(() => {
        if (!cancelled) setError('Unable to load history, please try again later.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [session, queryKey, ensureHistory])

  useEffect(() => {
    if (!session) return
    void ensureTemplateOptions()
  }, [session, ensureTemplateOptions])

  const handleLoadMore = useCallback(async () => {
    if (!cursor) return
    setIsLoadingMore(true)
    try {
      await loadMoreHistory()
    } catch {
      setError('Unable to load more history, please try again later.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [cursor, loadMoreHistory])

  const handleConfirmDelete = useCallback(
    (ids: string[]) => {
      // Optimistic removal (FR-014/015/016) — treat an already-deleted
      // entry (e.g. removed by a concurrent session) as a no-op success,
      // not an error, per spec.md's Edge Cases.
      removeHistoryItems(ids)
    },
    [removeHistoryItems],
  )

  const hasActiveFilters = Boolean(
    filters.templateId || filters.model || filters.from || filters.to,
  )

  if (isRestoring) return null
  if (!session) return <Navigate to="/login" replace />

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <div className="flex animate-[fade-slide-up_450ms_ease] flex-col gap-2">
        <span className="before:mr-1.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#3652E0] font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF] dark:before:bg-[#8493FF]">
          history
        </span>
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          Generated Prompt History
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
