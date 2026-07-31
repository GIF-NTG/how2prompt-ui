import { isApiConfigured } from '@/shared/utils/httpClient'
import type { TemplatesAdminClient } from './templatesAdminClient.types'
import { createMockTemplatesAdminClient } from './templatesAdminClient.mock'
import { createRealTemplatesAdminClient } from './templatesAdminClient.real'

export function createTemplatesAdminClient(accessToken?: string): TemplatesAdminClient {
  return isApiConfigured()
    ? createRealTemplatesAdminClient(accessToken)
    : createMockTemplatesAdminClient()
}
