import type { Category, CategoryUpsert, Tag, TaxonomyClient } from './taxonomyClient.types'
import { apiFetch } from '@/shared/utils/httpClient'

/**
 * Real implementation against docs/api/openapi.yaml's /admin/categories endpoints
 * plus the existing public /categories and /tags reads (contracts/admin-api.md).
 * No admin tag CRUD/merge endpoints exist, and no category DELETE endpoint exists —
 * see research.md Decision 3.
 */
export function createRealTaxonomyClient(): TaxonomyClient {
  return {
    async listCategories() {
      return apiFetch<Category[]>('/categories')
    },
    async createCategory(accessToken: string, input: CategoryUpsert) {
      return apiFetch<Category>('/admin/categories', { method: 'POST', accessToken, body: input })
    },
    async updateCategory(accessToken: string, id: string, input: CategoryUpsert) {
      return apiFetch<Category>(`/admin/categories/${id}`, { method: 'PATCH', accessToken, body: input })
    },
    async listTags() {
      return apiFetch<Tag[]>('/tags')
    },
  }
}
