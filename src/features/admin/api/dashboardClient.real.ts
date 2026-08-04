import { apiFetch } from '@/shared/utils/httpClient'
import type { DashboardClient, DashboardMetricSnapshot } from './dashboardClient.types'

export function createRealDashboardClient(accessToken?: string): DashboardClient {
  return {
    async getStats() {
      return apiFetch<DashboardMetricSnapshot>('/admin/analytics/dashboard', { accessToken })
    },
  }
}
