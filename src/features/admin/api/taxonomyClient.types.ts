import type { Category, Tag } from '@/features/home/types'

export type { Category, Tag }

/** Create/edit payload for a category. `slug`/`name` required; `parentId`
 *  optional (nullable) for nesting. No `CategoryUpsert` for tags exists — per
 *  FR-007a, tags are read-only in this feature. */
export interface CategoryUpsert {
  slug: string
  name: Category['name']
  description: Category['description']
  icon: string | null
  color: string | null
  parentId: string | null
  sortOrder: number
}

export interface TaxonomyClient {
  listCategories(): Promise<Category[]>
  createCategory(input: CategoryUpsert): Promise<Category>
  updateCategory(id: string, input: CategoryUpsert): Promise<Category>
  /** Read-only — no admin tag endpoints exist (FR-007a). */
  listTags(): Promise<Tag[]>
}
