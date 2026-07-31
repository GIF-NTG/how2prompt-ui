import { apiFetch } from '@/shared/utils/httpClient'
import type { Category, Tag } from '@/features/home/types'
import type { TaxonomyClient } from './taxonomyClient.types'

export function createRealTaxonomyClient(accessToken?: string): TaxonomyClient {
  return {
    // Reuses the existing public category-read endpoint — the contract has no
    // separate admin listing endpoint (contracts/admin-api.md).
    async listCategories() {
      return apiFetch<Category[]>('/categories')
    },

    async createCategory(input) {
      return apiFetch<Category>('/admin/categories', { method: 'POST', body: input, accessToken })
    },

    async updateCategory(id, input) {
      return apiFetch<Category>(`/admin/categories/${id}`, {
        method: 'PATCH',
        body: input,
        accessToken,
      })
    },

    async listTags() {
      return apiFetch<Tag[]>('/tags')
    },
  }
}
