import { createContext } from 'react'
import type { Category, Tag } from '../api/taxonomyClient.types'
import type { AiModel } from '../api/aiModelsClient.types'
import type { TaxonomyClient } from '../api/taxonomyClient.types'
import type { AiModelsClient } from '../api/aiModelsClient.types'
import type { DashboardClient, DashboardMetricSnapshot } from '../api/dashboardClient.types'
import type { AdminTemplate, TemplatesAdminClient } from '../api/templatesAdminClient.types'

export interface AdminDataContextValue {
  categories: Category[]
  categoriesLoaded: boolean
  tags: Tag[]
  tagsLoaded: boolean
  models: AiModel[]
  modelsLoaded: boolean
  dashboardStats: DashboardMetricSnapshot | null
  dashboardStatsLoaded: boolean
  templates: AdminTemplate[]
  templatesLoaded: boolean
  templatesCursor: string | null
  templatesHasMore: boolean
  error: string | null
  taxonomyClient: TaxonomyClient
  aiModelsClient: AiModelsClient
  dashboardClient: DashboardClient
  templatesAdminClient: TemplatesAdminClient
  /** Fetches only if not already loaded/in-flight — call from whichever page
   *  actually needs the resource (see `AdminDataProvider`). */
  ensureCategories: () => Promise<void>
  ensureTags: () => Promise<void>
  ensureModels: () => Promise<void>
  ensureDashboardStats: () => Promise<void>
  ensureTemplates: () => Promise<void>
  /** Forces a re-fetch of the first page — call after create/update/publish. */
  refetchCategories: () => Promise<void>
  refetchTags: () => Promise<void>
  refetchModels: () => Promise<void>
  refetchDashboardStats: () => Promise<void>
  refetchTemplates: () => Promise<void>
  /** Appends the next cursor page onto the cached list. */
  loadMoreTemplates: () => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
}

export const AdminDataContext = createContext<AdminDataContextValue | null>(null)
