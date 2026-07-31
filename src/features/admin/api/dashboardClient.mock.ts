import type { DashboardClient, DashboardMetricSnapshot } from './dashboardClient.types'

const BASE_STATS: DashboardMetricSnapshot = {
  totalUsers: 1280,
  dau: 142,
  wau: 610,
  mau: 980,
  totalTemplates: 36,
  totalPromptsGenerated: 5420,
  promptsToday: 87,
  topTemplates: [
    { templateId: 't1', title: { en: 'Debug effectively', vi: 'Debug lỗi hiệu quả' }, usageCount: 812 },
    { templateId: 't2', title: { en: 'Rewrite content style', vi: 'Sửa văn phong nội dung' }, usageCount: 604 },
  ],
  topModels: [
    { modelCode: 'gpt-4o', usageCount: 2100 },
    { modelCode: 'claude', usageCount: 1830 },
  ],
}

/** Varies its output slightly by whether a custom date range is applied, so
 *  the mock can demonstrate FR-016 without a real aggregation engine. */
export function createMockDashboardClient(): DashboardClient {
  return {
    async getStats(range) {
      if (!range.from && !range.to) {
        return BASE_STATS
      }
      return {
        ...BASE_STATS,
        dau: Math.round(BASE_STATS.dau * 0.6),
        promptsToday: Math.round(BASE_STATS.promptsToday * 0.6),
      }
    },
  }
}
