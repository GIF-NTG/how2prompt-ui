import type { I18nString } from '@/shared/types/api'

export interface Category {
  id: string
  slug: string
  name: I18nString
  description: I18nString
  icon: string | null
  color: string | null
  parentId: string | null
  sortOrder: number
  templateCount: number
}

export interface CategoryUpsert {
  slug: string
  name: I18nString
  description?: I18nString
  icon?: string
  color?: string
  parentId?: string | null
  sortOrder?: number
}

/** Read-only in this implementation — no admin tag endpoints exist yet
 *  (research.md Decision 3). */
export interface Tag {
  id: string
  slug: string
  name: string
  usageCount: number
}

export interface TaxonomyClient {
  listCategories(): Promise<Category[]>
  createCategory(accessToken: string, input: CategoryUpsert): Promise<Category>
  updateCategory(accessToken: string, id: string, input: CategoryUpsert): Promise<Category>
  listTags(): Promise<Tag[]>
}
