import { apiFetch } from '@/shared/utils/httpClient'
import type { TemplateClient } from './templateClient.types'
import type { TemplateListItem, AiModel, Category, Tag, I18nString } from '../types'

/** Shape actually returned by the real backend for a template list item, which
 *  diverges from `docs/api/openapi.yaml`'s `TemplateListItem` (titleI18n vs.
 *  title, official vs. isOfficial, models vs. supportedModels, publishedAt vs.
 *  createdAt, no `author`/`isFavorited`) — see project memory
 *  `project_templates_pagination_contract_drift`. Mapped to the FE's
 *  `TemplateListItem` shape below rather than propagating the raw fields. */
interface RawTemplateListItem {
  id: string
  slug: string
  titleI18n: I18nString
  descriptionI18n: I18nString
  coverImage: string | null
  official: boolean
  categories: Category[]
  tags: Tag[]
  models: string[]
  usageCount: number
  favoriteCount: number
  isFavorited?: boolean
  publishedAt: string
}

function mapTemplateListItem(raw: RawTemplateListItem): TemplateListItem {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.titleI18n,
    description: raw.descriptionI18n,
    coverImage: raw.coverImage,
    isOfficial: raw.official,
    author: { id: null, fullName: null, username: null, avatarUrl: null, type: 'admin' },
    categories: raw.categories ?? [],
    tags: raw.tags ?? [],
    supportedModels: raw.models ?? [],
    usageCount: raw.usageCount,
    favoriteCount: raw.favoriteCount,
    isFavorited: raw.isFavorited ?? false,
    createdAt: raw.publishedAt,
  }
}

interface TemplatesPage {
  items: RawTemplateListItem[]
  nextCursor: string | null
  hasMore: boolean
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
      if (params.cursor) searchParams.set('cursor', params.cursor)
      if (params.size !== undefined) searchParams.set('size', String(params.size))
      const qs = searchParams.toString()
      const page = await apiFetch<TemplatesPage>(`/templates${qs ? `?${qs}` : ''}`)
      return { ...page, items: page.items.map(mapTemplateListItem) }
    },

    async getFeatured() {
      const { items } = await apiFetch<{ items: RawTemplateListItem[] }>('/templates/featured')
      return items.map(mapTemplateListItem)
    },

    async getTrending(params) {
      const searchParams = new URLSearchParams()
      if (params?.window) searchParams.set('window', params.window)
      const qs = searchParams.toString()
      const { items } = await apiFetch<{ items: RawTemplateListItem[] }>(
        `/templates/trending${qs ? `?${qs}` : ''}`,
      )
      return items.map(mapTemplateListItem)
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

    async toggleFavorite(templateId, isFavorited) {
      await apiFetch<void>(`/templates/${templateId}/favorite`, {
        method: isFavorited ? 'DELETE' : 'POST',
      })
      return { isFavorited: !isFavorited }
    },
  }
}
