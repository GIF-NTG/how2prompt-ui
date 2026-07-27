import { apiFetch } from '@/shared/utils/httpClient'
import type { TemplateClient } from './templateClient.types'
import type { TemplateListItem, AiModel, Category, Tag } from '../types'
import type { PageInfo } from '@/shared/types/api'

interface TemplatesResponse {
  data: TemplateListItem[]
  page_info: PageInfo
  total_count: number
}

export function createRealTemplateClient(): TemplateClient {
  return {
    async getTemplates(params) {
      const searchParams = new URLSearchParams()
      if (params.q) searchParams.set('q', params.q)
      if (params.category) searchParams.set('category', params.category)
      if (params.tags) searchParams.set('tags', params.tags)
      if (params.model) searchParams.set('model', params.model)
      if (params.sort) searchParams.set('sort', params.sort)
      if (params.limit) searchParams.set('limit', String(params.limit))
      if (params.cursor) searchParams.set('cursor', params.cursor)
      const qs = searchParams.toString()
      return apiFetch<TemplatesResponse>(`/templates${qs ? `?${qs}` : ''}`)
    },

    async getFeatured() {
      return apiFetch<TemplateListItem[]>('/templates/featured')
    },

    async getTrending(params) {
      const searchParams = new URLSearchParams()
      if (params?.window) searchParams.set('window', params.window)
      const qs = searchParams.toString()
      return apiFetch<TemplateListItem[]>(`/templates/trending${qs ? `?${qs}` : ''}`)
    },

    async getModels() {
      return apiFetch<AiModel[]>('/ai-models')
    },

    async getCategories() {
      return apiFetch<Category[]>('/categories')
    },

    async getTags(params) {
      const searchParams = new URLSearchParams()
      if (params?.q) searchParams.set('q', params.q)
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const qs = searchParams.toString()
      return apiFetch<Tag[]>(`/tags${qs ? `?${qs}` : ''}`)
    },

    async toggleFavorite(templateId) {
      return apiFetch<{ is_favorited: boolean }>(`/templates/${templateId}/favorite`, { method: 'POST' })
    },
  }
}
