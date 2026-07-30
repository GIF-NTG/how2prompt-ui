import { apiFetch, apiFetchPage } from '@/shared/utils/httpClient'
import type { TemplateListItem } from '@/features/home/types'
import type { HistoryClient } from './historyClient.types'
import type { HistoryDetail, HistoryListItem } from '../types'

export function createRealHistoryClient(accessToken?: string): HistoryClient {
  return {
    async list(filters, page, size) {
      const searchParams = new URLSearchParams()
      if (filters.templateId) searchParams.set('templateId', filters.templateId)
      if (filters.model) searchParams.set('model', filters.model)
      if (filters.from) searchParams.set('from', filters.from)
      if (filters.to) searchParams.set('to', filters.to)
      searchParams.set('page', String(page))
      searchParams.set('size', String(size))
      return apiFetchPage<HistoryListItem[]>(`/generated-prompts?${searchParams.toString()}`, {
        accessToken,
      })
    },

    async get(id) {
      return apiFetch<HistoryDetail>(`/generated-prompts/${id}`, { accessToken })
    },

    async remove(id) {
      await apiFetch<void>(`/generated-prompts/${id}`, { method: 'DELETE', accessToken })
    },

    async listFavorites(page, size) {
      const searchParams = new URLSearchParams()
      searchParams.set('page', String(page))
      searchParams.set('size', String(size))
      return apiFetchPage<TemplateListItem[]>(`/favorites?${searchParams.toString()}`, {
        accessToken,
      })
    },
  }
}
