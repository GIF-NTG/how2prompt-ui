import { isApiConfigured } from '@/shared/utils/httpClient'
import type { DashboardClient } from './dashboardClient.types'
import { createMockDashboardClient } from './dashboardClient.mock'
import { createRealDashboardClient } from './dashboardClient.real'

export function createDashboardClient(accessToken?: string): DashboardClient {
  return isApiConfigured()
    ? createRealDashboardClient(accessToken)
    : createMockDashboardClient()
}
