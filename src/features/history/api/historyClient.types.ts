import type { TemplateListItem } from '@/features/home/types'
import type { HistoryDetail, HistoryFilters, HistoryListItem } from '../types'

export interface HistoryClient {
  list(
    filters: Partial<HistoryFilters>,
    cursor: string | null,
    size: number,
  ): Promise<{ items: HistoryListItem[]; nextCursor: string | null; hasMore: boolean }>
  get(id: string): Promise<HistoryDetail>
  remove(id: string): Promise<void>
  listFavorites(
    cursor: string | null,
    size: number,
  ): Promise<{ items: TemplateListItem[]; nextCursor: string | null; hasMore: boolean }>
}
