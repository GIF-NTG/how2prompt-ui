import { apiFetch } from '@/shared/utils/httpClient'
import type { Tag } from '@/features/home/types'
import { mapCategory, type RawCategory } from '@/features/home/api/templateClient.real'
import type { TaxonomyClient, TagUpsert } from './taxonomyClient.types'

export function createRealTaxonomyClient(accessToken?: string): TaxonomyClient {
  return {
    // Reuses the existing public category-read endpoint — the real backend
    // has no separate admin listing endpoint (verified against its live
    // `/v3/api-docs`; `docs/api/openapi.yaml` in this repo is stale here).
    async listCategories() {
      const categories = await apiFetch<RawCategory[]>('/categories')
      return categories.map(mapCategory)
    },

    // `/admin/categories` wants `nameI18n`/`descriptionI18n`, not the
    // `name`/`description` keys `CategoryUpsert` uses elsewhere in the app —
    // translated here rather than growing the shared type.
    async createCategory(input) {
      const category = await apiFetch<RawCategory>('/admin/categories', {
        method: 'POST',
        body: {
          slug: input.slug,
          nameI18n: input.name,
          descriptionI18n: input.description,
          icon: input.icon ?? undefined,
          color: input.color ?? undefined,
          parentId: input.parentId ?? undefined,
          sortOrder: input.sortOrder,
        },
        accessToken,
      })
      return mapCategory(category)
    },

    async updateCategory(id, input) {
      const category = await apiFetch<RawCategory>(`/admin/categories/${id}`, {
        method: 'PATCH',
        body: {
          slug: input.slug,
          nameI18n: input.name,
          descriptionI18n: input.description,
          icon: input.icon ?? undefined,
          color: input.color ?? undefined,
          parentId: input.parentId ?? undefined,
          sortOrder: input.sortOrder,
        },
        accessToken,
      })
      return mapCategory(category)
    },

    async deleteCategory(id) {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE', accessToken })
    },

    async listTags() {
      return apiFetch<Tag[]>('/tags')
    },

    async createTag(input: TagUpsert) {
      return apiFetch<Tag>('/admin/tags', { method: 'POST', body: input, accessToken })
    },

    async updateTag(id, input: TagUpsert) {
      return apiFetch<Tag>(`/admin/tags/${id}`, { method: 'PATCH', body: input, accessToken })
    },

    async deleteTag(id) {
      await apiFetch(`/admin/tags/${id}`, { method: 'DELETE', accessToken })
    },
  }
}
