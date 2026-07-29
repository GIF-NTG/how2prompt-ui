import type { TemplatesAdminClient } from './templatesAdminClient.types'
import { createMockTemplatesAdminClient } from './templatesAdminClient.mock'
import { createRealTemplatesAdminClient } from './templatesAdminClient.real'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const templatesAdminClient: TemplatesAdminClient = API_BASE_URL
  ? createRealTemplatesAdminClient()
  : createMockTemplatesAdminClient()
