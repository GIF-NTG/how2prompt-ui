import type { PageMeta } from '@/shared/types/api'
import type { TemplateListItem } from '@/features/home/types'
import type { HistoryDetail, HistoryFilters, HistoryListItem } from '../types'

export interface HistoryClient {
  list(
    filters: Partial<HistoryFilters>,
    page: number,
    size: number,
  ): Promise<{ data: HistoryListItem[]; meta: PageMeta }>
  get(id: string): Promise<HistoryDetail>
  remove(id: string): Promise<void>
  listFavorites(page: number, size: number): Promise<{ data: TemplateListItem[]; meta: PageMeta }>
}
