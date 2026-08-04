import { createContext } from 'react'
import type { Category, Tag, AiModel, TemplateListItem } from '../types'

export interface TemplatesQueryParams {
  q?: string
  category?: string
  tags?: string
  model?: string
  sort?: 'popular' | 'newest' | 'most_used' | 'official'
}

export interface HomeDataContextValue {
  categories: Category[]
  categoriesLoaded: boolean
  tags: Tag[]
  tagsLoaded: boolean
  models: AiModel[]
  modelsLoaded: boolean
  featured: TemplateListItem[]
  featuredLoaded: boolean
  trending: TemplateListItem[]
  trendingLoaded: boolean
  templates: TemplateListItem[]
  templatesCursor: string | null
  templatesHasMore: boolean
  /** True once a request has resolved for the *current* `templates`/`templatesQueryKey`
   *  pair — flips back while a new query key is loading (see `ensureTemplates`). */
  templatesLoaded: boolean
  /** Fetches only if not already loaded/in-flight — call from whichever
   *  component actually needs the resource (see `HomeDataProvider`). */
  ensureCategories: () => Promise<void>
  ensureTags: () => Promise<void>
  ensureModels: () => Promise<void>
  ensureFeatured: (accessToken?: string) => Promise<void>
  ensureTrending: (accessToken?: string) => Promise<void>
  /** Re-fetches only when `params`/`accessToken` differ from the last
   *  successfully-cached query — revisiting Home with the same filters
   *  reuses the cached list instead of re-fetching. */
  ensureTemplates: (params: TemplatesQueryParams, accessToken?: string) => Promise<void>
  /** Appends the next cursor page onto the cached list for the last query. */
  loadMoreTemplates: () => Promise<void>
}

export const HomeDataContext = createContext<HomeDataContextValue | null>(null)
