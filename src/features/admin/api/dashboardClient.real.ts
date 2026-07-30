import type {
  DashboardClient,
  DashboardDateRange,
  DashboardMetricSnapshot,
} from './dashboardClient.types'
import { apiFetch } from '@/shared/utils/httpClient'

/**
 * Real implementation against docs/api/openapi.yaml's GET /admin/dashboard/stats
 * (contracts/admin-api.md). No conversion-funnel field exists in the contract's
 * DashboardStats schema — see research.md Decision 3; not modeled here.
 */
export function createRealDashboardClient(): DashboardClient {
  return {
    async getStats(accessToken: string, range: DashboardDateRange) {
      const searchParams = new URLSearchParams()
      if (range.from) searchParams.set('from', range.from)
      if (range.to) searchParams.set('to', range.to)
      const qs = searchParams.toString()
      return apiFetch<DashboardMetricSnapshot>(`/admin/dashboard/stats${qs ? `?${qs}` : ''}`, {
        accessToken,
      })
    },
  }
}
