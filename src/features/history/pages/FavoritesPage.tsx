import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { createHistoryClient } from '../api/historyClient'
import { FavoriteTemplateGrid } from '../components/FavoriteTemplateGrid'
import { EmptyState } from '@/features/home/components/EmptyState'
import { TemplateGridSkeleton } from '@/features/home/components/TemplateGridSkeleton'
import type { TemplateListItem } from '@/features/home/types'

const PAGE_SIZE = 20

export function FavoritesPage() {
  const { session, isRestoring } = useAuth()
  const historyClient = useMemo(() => createHistoryClient(session?.token), [session?.token])

  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestGeneration = useRef(0)

  const loadData = useCallback(async () => {
    const generation = ++requestGeneration.current
    setLoading(true)
    setError(null)
    try {
      const result = await historyClient.listFavorites(null, PAGE_SIZE)
      if (generation !== requestGeneration.current) return
      setTemplates(result.items)
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch {
      if (generation !== requestGeneration.current) return
      setError('Unable to load your favorites, please try again later.')
    } finally {
      if (generation === requestGeneration.current) setLoading(false)
    }
  }, [historyClient])

  useEffect(() => {
    if (!session) return
    void loadData()
  }, [session, loadData])

  const handleLoadMore = useCallback(async () => {
    const generation = requestGeneration.current
    if (!cursor) return
    setIsLoadingMore(true)
    try {
      const result = await historyClient.listFavorites(cursor, PAGE_SIZE)
      if (generation !== requestGeneration.current) return
      setTemplates((prev) => [...prev, ...result.items])
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch {
      if (generation !== requestGeneration.current) return
      setError('Unable to load more, please try again later.')
    } finally {
      if (generation === requestGeneration.current) setIsLoadingMore(false)
    }
  }, [historyClient, cursor])

  const handleUnfavorited = useCallback((templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId))
  }, [])

  if (isRestoring) return null
  if (!session) return <Navigate to="/login" replace />

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <div className="flex animate-[fade-slide-up_450ms_ease] flex-col gap-2">
        <span className="before:mr-1.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#3652E0] font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF] dark:before:bg-[#8493FF]">
          favorites
        </span>
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          Favorited Templates
        </h1>
      </div>

      {error ? (
        <p className="m-0 text-[0.88rem] text-[#C23A2E] dark:text-[#FF7A6B]">{error}</p>
      ) : loading ? (
        <TemplateGridSkeleton count={4} />
      ) : templates.length === 0 ? (
        <EmptyState />
      ) : (
        <FavoriteTemplateGrid
          templates={templates}
          onUnfavorited={handleUnfavorited}
          hasNext={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={() => void handleLoadMore()}
        />
      )}
    </main>
  )
}
