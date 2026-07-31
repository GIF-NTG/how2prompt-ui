import { isApiConfigured } from '@/shared/utils/httpClient'
import type { AiModelsClient } from './aiModelsClient.types'
import { createMockAiModelsClient } from './aiModelsClient.mock'
import { createRealAiModelsClient } from './aiModelsClient.real'

export function createAiModelsClient(accessToken?: string): AiModelsClient {
  return isApiConfigured()
    ? createRealAiModelsClient(accessToken)
    : createMockAiModelsClient()
}
