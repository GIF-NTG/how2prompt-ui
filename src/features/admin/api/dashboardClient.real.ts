import { apiFetch } from '@/shared/utils/httpClient'
import type { DashboardClient, DashboardMetricSnapshot } from './dashboardClient.types'

export function createRealDashboardClient(accessToken?: string): DashboardClient {
  return {
    async getStats(range) {
      const searchParams = new URLSearchParams()
      if (range.from) searchParams.set('from', range.from)
      if (range.to) searchParams.set('to', range.to)
      const qs = searchParams.toString()
      return apiFetch<DashboardMetricSnapshot>(
        `/admin/dashboard/stats${qs ? `?${qs}` : ''}`,
        { accessToken },
      )
    },
  }
}
