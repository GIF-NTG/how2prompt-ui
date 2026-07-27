import { apiFetch } from '@/shared/utils/httpClient'
import type { TemplateDetailClient } from './templateDetailClient.types'
import type { TemplateDetail } from '../types'

export function createRealTemplateDetailClient(): TemplateDetailClient {
  return {
    async getDetail(slug) {
      return apiFetch<TemplateDetail>(`/templates/${slug}`)
    },

    async toggleFavorite(templateId) {
      return apiFetch<{ is_favorited: boolean }>(`/templates/${templateId}/favorite`, {
        method: 'POST',
      })
    },

    async incrementViewCount(slug) {
      await apiFetch(`/templates/${slug}/view`, { method: 'POST' })
    },
  }
}
