import type { I18nString } from '@/shared/types/api'

/** Modeled on the live `analytics-admin-controller#dashboard` response
 *  (`GET /admin/analytics/dashboard`), which supersedes the `DashboardStats`
 *  shape and `/admin/dashboard/stats` path previously documented in
 *  `docs/api/openapi.yaml`. The endpoint now also exposes `conversionFunnel`,
 *  closing the gap tracked as FR-015a / `specs/011-admin-content-management`
 *  research.md Decision 3. */
export interface DashboardMetricSnapshot {
  dau: number
  wau: number
  mau: number
  /** ISO date (`YYYY-MM-DD`) -> prompt count for that day. */
  promptsGeneratedPerDay: Record<string, number>
  popularTemplates: { templateId: string; slug: string; titleI18n: I18nString; usageCount: number }[]
  mostUsedModels: { modelId: string; name: string; usageCount: number }[]
  conversionFunnel: {
    signups: number
    verifiedEmails: number
    promptGenerations: number
  }
}

export interface DashboardDateRange {
  from: string | null
  to: string | null
}

export interface DashboardClient {
  getStats(): Promise<DashboardMetricSnapshot>
}
