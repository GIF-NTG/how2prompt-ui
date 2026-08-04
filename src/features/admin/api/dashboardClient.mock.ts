import type { DashboardClient, DashboardMetricSnapshot } from './dashboardClient.types'
import { daysAgoIso } from '../utils/dateRange'

function buildPromptsGeneratedPerDay(): Record<string, number> {
  const entries: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    entries[daysAgoIso(i)] = 40 + Math.round(Math.random() * 60)
  }
  return entries
}

const STATS: DashboardMetricSnapshot = {
  dau: 142,
  wau: 610,
  mau: 980,
  promptsGeneratedPerDay: buildPromptsGeneratedPerDay(),
  popularTemplates: [
    {
      templateId: 't1',
      slug: 'debug-effectively',
      titleI18n: { en: 'Debug effectively', vi: 'Debug lỗi hiệu quả' },
      usageCount: 812,
    },
    {
      templateId: 't2',
      slug: 'rewrite-content-style',
      titleI18n: { en: 'Rewrite content style', vi: 'Sửa văn phong nội dung' },
      usageCount: 604,
    },
  ],
  mostUsedModels: [
    { modelId: 'm1', name: 'gpt-4o', usageCount: 2100 },
    { modelId: 'm2', name: 'claude', usageCount: 1830 },
  ],
  conversionFunnel: {
    signups: 1280,
    verifiedEmails: 1040,
    promptGenerations: 860,
  },
}

export function createMockDashboardClient(): DashboardClient {
  return {
    async getStats() {
      return STATS
    },
  }
}
