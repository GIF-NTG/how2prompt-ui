import type { DashboardClient } from './dashboardClient.types'
import { createMockDashboardClient } from './dashboardClient.mock'
import { createRealDashboardClient } from './dashboardClient.real'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const dashboardClient: DashboardClient = API_BASE_URL
  ? createRealDashboardClient()
  : createMockDashboardClient()
