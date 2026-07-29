import type { Category, CategoryUpsert, Tag, TaxonomyClient } from './taxonomyClient.types'

let mockCategories: Category[] = [
  {
    id: 'c1',
    slug: 'marketing',
    name: { en: 'Marketing', vi: 'Tiếp thị' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parentId: null,
    sortOrder: 1,
    templateCount: 2,
  },
  {
    id: 'c2',
    slug: 'social-media',
    name: { en: 'Social Media', vi: 'Mạng xã hội' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parentId: 'c1',
    sortOrder: 1,
    templateCount: 1,
  },
  {
    id: 'c3',
    slug: 'coding',
    name: { en: 'Coding', vi: 'Lập trình' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parentId: null,
    sortOrder: 2,
    templateCount: 3,
  },
]

const mockTags: Tag[] = [
  { id: 't1', slug: 'email', name: 'email', usageCount: 12 },
  { id: 't2', slug: 'debugging', name: 'debugging', usageCount: 8 },
  { id: 't3', slug: 'seo', name: 'seo', usageCount: 5 },
]

function createId(): string {
  return `c.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`
}

export function createMockTaxonomyClient(): TaxonomyClient {
  return {
    async listCategories() {
      return [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder)
    },
    async createCategory(_accessToken: string, input: CategoryUpsert) {
      const category: Category = {
        id: createId(),
        slug: input.slug,
        name: input.name,
        description: input.description ?? { en: '' },
        icon: input.icon ?? null,
        color: input.color ?? null,
        parentId: input.parentId ?? null,
        sortOrder: input.sortOrder ?? mockCategories.length + 1,
        templateCount: 0,
      }
      mockCategories = [...mockCategories, category]
      return category
    },
    async updateCategory(_accessToken: string, id: string, input: CategoryUpsert) {
      let updated: Category | undefined
      mockCategories = mockCategories.map((category) => {
        if (category.id !== id) return category
        updated = {
          ...category,
          slug: input.slug,
          name: input.name,
          description: input.description ?? category.description,
          icon: input.icon ?? category.icon,
          color: input.color ?? category.color,
          parentId: input.parentId === undefined ? category.parentId : input.parentId,
          sortOrder: input.sortOrder ?? category.sortOrder,
        }
        return updated
      })
      if (!updated) throw new Error(`Category ${id} not found`)
      return updated
    },
    async listTags() {
      return [...mockTags]
    },
  }
}
