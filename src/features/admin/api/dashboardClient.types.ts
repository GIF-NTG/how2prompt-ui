import type { I18nString } from '@/shared/types/api'

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
  from?: string
  to?: string
}

export interface DashboardClient {
  getStats(accessToken: string, range: DashboardDateRange): Promise<DashboardMetricSnapshot>
}
