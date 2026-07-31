import type { I18nString } from '@/shared/types/api'

/** Modeled on `DashboardStats` (docs/api/openapi.yaml). No signup→first-generate
 *  conversion field exists in the contract — omitted per FR-015a /
 *  research.md Decision 3. */
export interface DashboardMetricSnapshot {
  totalUsers: number
  dau: number
  wau: number
  mau: number
  totalTemplates: number
  totalPromptsGenerated: number
  promptsToday: number
  topTemplates: { templateId: string; title: I18nString; usageCount: number }[]
  topModels: { modelCode: string; usageCount: number }[]
}

export interface DashboardDateRange {
  from: string | null
  to: string | null
}

export interface DashboardClient {
  getStats(range: DashboardDateRange): Promise<DashboardMetricSnapshot>
}
