import { apiFetch } from '@/shared/utils/httpClient'
import type { Tag } from '@/features/home/types'
import { mapCategory, type RawCategory } from '@/features/home/api/templateClient.real'
import type { TaxonomyClient } from './taxonomyClient.types'

export function createRealTaxonomyClient(accessToken?: string): TaxonomyClient {
  return {
    // Reuses the existing public category-read endpoint — the contract has no
    // separate admin listing endpoint (contracts/admin-api.md).
    async listCategories() {
      const categories = await apiFetch<RawCategory[]>('/categories')
      return categories.map(mapCategory)
    },

    async createCategory(input) {
      const category = await apiFetch<RawCategory>('/admin/categories', {
        method: 'POST',
        body: input,
        accessToken,
      })
      return mapCategory(category)
    },

    async updateCategory(id, input) {
      const category = await apiFetch<RawCategory>(`/admin/categories/${id}`, {
        method: 'PATCH',
        body: input,
        accessToken,
      })
      return mapCategory(category)
    },

    async listTags() {
      return apiFetch<Tag[]>('/tags')
    },
  }
}
