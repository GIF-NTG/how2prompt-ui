import { createContext } from 'react'
import type { Category, Tag } from '../api/taxonomyClient.types'
import type { AiModel } from '../api/aiModelsClient.types'
import type { TaxonomyClient } from '../api/taxonomyClient.types'
import type { AiModelsClient } from '../api/aiModelsClient.types'

export interface AdminDataContextValue {
  categories: Category[]
  categoriesLoaded: boolean
  tags: Tag[]
  tagsLoaded: boolean
  models: AiModel[]
  modelsLoaded: boolean
  error: string | null
  taxonomyClient: TaxonomyClient
  aiModelsClient: AiModelsClient
  /** Fetches only if not already loaded/in-flight — call from whichever page
   *  actually needs the resource (see `AdminDataProvider`). */
  ensureCategories: () => Promise<void>
  ensureTags: () => Promise<void>
  ensureModels: () => Promise<void>
  /** Forces a re-fetch — call after create/update/delete. */
  refetchCategories: () => Promise<void>
  refetchTags: () => Promise<void>
  refetchModels: () => Promise<void>
}

export const AdminDataContext = createContext<AdminDataContextValue | null>(null)
