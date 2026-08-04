import type { Category, Tag } from '@/features/home/types'

export type { Category, Tag }

/** Create/edit payload for a category. `slug`/`name` required; `parentId`
 *  optional (nullable) for nesting. */
export interface CategoryUpsert {
  slug: string
  name: Category['name']
  description: Category['description']
  icon: string | null
  color: string | null
  parentId: string | null
  sortOrder: number
}

/** Create/edit payload for a tag — flat (no i18n), per `CreateTagRequest`/
 *  `TagResponse` on the real backend (`taxonomy-admin-controller`). */
export interface TagUpsert {
  slug: string
  name: string
}

export interface TaxonomyClient {
  listCategories(): Promise<Category[]>
  createCategory(input: CategoryUpsert): Promise<Category>
  updateCategory(id: string, input: CategoryUpsert): Promise<Category>
  deleteCategory(id: string): Promise<void>
  listTags(): Promise<Tag[]>
  createTag(input: TagUpsert): Promise<Tag>
  updateTag(id: string, input: TagUpsert): Promise<Tag>
  deleteTag(id: string): Promise<void>
}
