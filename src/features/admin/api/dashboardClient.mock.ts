import type {
  DashboardClient,
  DashboardDateRange,
  DashboardMetricSnapshot,
} from './dashboardClient.types'

const BASE_STATS: DashboardMetricSnapshot = {
  totalUsers: 1240,
  dau: 86,
  wau: 412,
  mau: 980,
  totalTemplates: 57,
  totalPromptsGenerated: 5210,
  promptsToday: 64,
  topTemplates: [
    { templateId: 'tpl-1', title: { en: 'Blog outline generator' }, usageCount: 320 },
    { templateId: 'tpl-2', title: { en: 'Bug report writer' }, usageCount: 245 },
    { templateId: 'tpl-3', title: { en: 'Email marketing copy' }, usageCount: 198 },
  ],
  topModels: [
    { modelCode: 'gpt-4o', usageCount: 2100 },
    { modelCode: 'claude', usageCount: 1830 },
    { modelCode: 'gemini', usageCount: 640 },
  ],
}

/** A custom date range narrows the mock's headline figures proportionally to the
 *  requested window length, so quickstart.md §5's "figures change" check has
 *  something real to observe without a backend. */
function scaleForRange(range: DashboardDateRange): number {
  if (!range.from || !range.to) return 1
  const days = Math.max(
    1,
    Math.round(
      (new Date(range.to).getTime() - new Date(range.from).getTime()) / (24 * 60 * 60 * 1000),
    ),
  )
  return Math.min(1, days / 30)
}

export function createMockDashboardClient(): DashboardClient {
  return {
    async getStats(_accessToken: string, range: DashboardDateRange) {
      const scale = scaleForRange(range)
      return {
        ...BASE_STATS,
        totalPromptsGenerated: Math.round(BASE_STATS.totalPromptsGenerated * scale),
        promptsToday: BASE_STATS.promptsToday,
        topTemplates: BASE_STATS.topTemplates.map((t) => ({
          ...t,
          usageCount: Math.round(t.usageCount * scale),
        })),
        topModels: BASE_STATS.topModels.map((m) => ({
          ...m,
          usageCount: Math.round(m.usageCount * scale),
        })),
      }
    },
  }
}
