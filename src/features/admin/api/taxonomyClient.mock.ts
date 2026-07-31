import { MOCK_CATEGORIES, MOCK_TAGS } from '@/features/home/api/templateClient.mock'
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

    async listTags() {
      return [...MOCK_TAGS]
    },
  }
}
