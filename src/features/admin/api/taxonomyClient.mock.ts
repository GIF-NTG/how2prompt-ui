import { MOCK_CATEGORIES, MOCK_TAGS } from '@/features/home/api/templateClient.mock'
import { ApiError } from '@/shared/utils/httpClient'
import type { TaxonomyClient } from './taxonomyClient.types'

let nextId = 1000

export function createMockTaxonomyClient(): TaxonomyClient {
  return {
    async listCategories() {
      return [...MOCK_CATEGORIES]
    },

    async createCategory(input) {
      const created = { id: `cat${nextId++}`, templateCount: 0, ...input }
      MOCK_CATEGORIES.push(created)
      return created
    },

    async updateCategory(id, input) {
      const index = MOCK_CATEGORIES.findIndex((c) => c.id === id)
      if (index === -1) {
        throw new Error(`Category ${id} not found`)
      }
      const updated = { ...MOCK_CATEGORIES[index], ...input, id }
      MOCK_CATEGORIES[index] = updated
      return updated
    },

    async deleteCategory(id) {
      const index = MOCK_CATEGORIES.findIndex((c) => c.id === id)
      if (index === -1) {
        throw new ApiError('NOT_FOUND', `Category ${id} not found`, 404)
      }
      MOCK_CATEGORIES.splice(index, 1)
    },

    async listTags() {
      return [...MOCK_TAGS]
    },

    async createTag(input) {
      const created = { id: `tag${nextId++}`, usageCount: 0, ...input }
      MOCK_TAGS.push(created)
      return created
    },

    async updateTag(id, input) {
      const index = MOCK_TAGS.findIndex((t) => t.id === id)
      if (index === -1) {
        throw new ApiError('NOT_FOUND', `Tag ${id} not found`, 404)
      }
      const updated = { ...MOCK_TAGS[index], ...input, id }
      MOCK_TAGS[index] = updated
      return updated
    },

    async deleteTag(id) {
      const index = MOCK_TAGS.findIndex((t) => t.id === id)
      if (index === -1) {
        throw new ApiError('NOT_FOUND', `Tag ${id} not found`, 404)
      }
      MOCK_TAGS.splice(index, 1)
    },
  }
}
