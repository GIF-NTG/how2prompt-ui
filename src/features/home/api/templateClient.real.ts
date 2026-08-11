import { apiFetch } from '@/shared/utils/httpClient'
import type { TemplateClient } from './templateClient.types'
import type { TemplateListItem, AiModel, Category, Tag, I18nString } from '../types'

/** Shape actually returned by the real backend for a category, which diverges
 *  from `docs/api/openapi.yaml`'s `Category` (nameI18n/descriptionI18n vs.
 *  name/description, plus an `isActive`/`children` the FE type doesn't model
 *  and no `templateCount`) — same kind of drift as
 *  `project_templates_pagination_contract_drift`. Every endpoint that returns
 *  a category (public `/categories`, nested on a template, and the admin
 *  taxonomy CRUD endpoints) sends this same raw shape, so `mapCategory` is
 *  exported for reuse by `templateDetailClient.real.ts` and
 *  `taxonomyClient.real.ts` rather than re-implemented per file. */
export interface RawCategory {
  id: string
  slug: string
  nameI18n: I18nString
  descriptionI18n: I18nString
  icon: string | null
  color: string | null
  parentId: string | null
  sortOrder: number
}

export function mapCategory(raw: RawCategory): Category {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.nameI18n,
    description: raw.descriptionI18n,
    icon: raw.icon,
    color: raw.color,
    parentId: raw.parentId,
    sortOrder: raw.sortOrder,
    templateCount: 0,
  }
}

/** Shape actually returned by the real backend for a template list item, which
 *  diverges from `docs/api/openapi.yaml`'s `TemplateListItem` (titleI18n vs.
 *  title, official vs. isOfficial, models vs. supportedModels, publishedAt vs.
 *  createdAt, no `author`/`isFavorited`) — see project memory
 *  `project_templates_pagination_contract_drift`. Mapped to the FE's
 *  `TemplateListItem` shape below rather than propagating the raw fields. */
export interface RawTemplateListItem {
  id: string
  slug: string
  titleI18n: I18nString
  descriptionI18n: I18nString
  coverImage: string | null
  official: boolean
  isFeatured?: boolean
  categories: RawCategory[]
  tags: Tag[]
  // Despite the name, the backend actually sends full model objects here
  // (`{id, code, name, iconUrl}`), not plain code strings — extracted to
  // `.code` below rather than propagated as-is, since `TemplateListItem`
  // (and every renderer of `supportedModels`, e.g. TemplateCard) expects
  // string codes.
  models: (string | { code: string })[]
  usageCount: number
  favoriteCount: number
  isFavorited?: boolean
  publishedAt: string
}

export function mapTemplateListItem(raw: RawTemplateListItem): TemplateListItem {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.titleI18n,
    description: raw.descriptionI18n,
    coverImage: raw.coverImage,
    isOfficial: raw.official,
    isFeatured: raw.isFeatured ?? false,
    author: { id: null, fullName: null, username: null, avatarUrl: null, type: 'admin' },
    categories: (raw.categories ?? []).map(mapCategory),
    tags: raw.tags ?? [],
    supportedModels: (raw.models ?? []).map((m) => (typeof m === 'string' ? m : m.code)),
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
    // Query param names verified against the real backend's live
    // `/v3/api-docs` (not `docs/api/openapi.yaml`, which is stale here):
    // `search`/`tag`/`limit`, not `q`/`tags`/`size` — the old names were
    // silently ignored by the backend, so search/tag-filter/page-size were
    // all no-ops (every request just returned the full unfiltered catalog).
    async getTemplates(params, accessToken) {
      const searchParams = new URLSearchParams()
      if (params.q) searchParams.set('search', params.q)
      if (params.category) searchParams.set('category', params.category)
      if (params.tags) searchParams.set('tag', params.tags)
      if (params.model) searchParams.set('model', params.model)
      if (params.sort) searchParams.set('sort', params.sort)
      if (params.cursor) searchParams.set('cursor', params.cursor)
      if (params.size !== undefined) searchParams.set('limit', String(params.size))
      const qs = searchParams.toString()
      const page = await apiFetch<TemplatesPage>(`/templates${qs ? `?${qs}` : ''}`, {
        accessToken,
      })
      return { ...page, items: page.items.map(mapTemplateListItem) }
    },

    async getFeatured(accessToken) {
      const { items } = await apiFetch<{ items: RawTemplateListItem[] }>('/templates/featured', {
        accessToken,
      })
      return items.map(mapTemplateListItem)
    },

    async getTrending(params, accessToken) {
      const searchParams = new URLSearchParams()
      if (params?.window) searchParams.set('window', params.window)
      const qs = searchParams.toString()
      const { items } = await apiFetch<{ items: RawTemplateListItem[] }>(
        `/templates/trending${qs ? `?${qs}` : ''}`,
        { accessToken },
      )
      return items.map(mapTemplateListItem)
    },

    async getModels() {
      return apiFetch<AiModel[]>('/ai-models')
    },

    async getCategories() {
      const categories = await apiFetch<RawCategory[]>('/categories')
      return categories.map(mapCategory)
    },

    async getTags(params) {
      const searchParams = new URLSearchParams()
      if (params?.q) searchParams.set('q', params.q)
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const qs = searchParams.toString()
      return apiFetch<Tag[]>(`/tags${qs ? `?${qs}` : ''}`)
    },

    async toggleFavorite(templateId, isFavorited, accessToken) {
      await apiFetch<void>(`/templates/${templateId}/favorite`, {
        method: isFavorited ? 'DELETE' : 'POST',
        accessToken,
      })
      return { isFavorited: !isFavorited }
    },
  }
}
