import { isApiConfigured } from '@/shared/utils/httpClient'
import type { TemplateAuthoringClient } from './templateAuthoringClient.types'
import { createMockTemplateAuthoringClient } from './templateAuthoringClient.mock'
import { createRealTemplateAuthoringClient } from './templateAuthoringClient.real'

export function createTemplateAuthoringClient(accessToken?: string): TemplateAuthoringClient {
  return isApiConfigured()
    ? createRealTemplateAuthoringClient(accessToken)
    : createMockTemplateAuthoringClient()
}
