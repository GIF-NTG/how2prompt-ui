import { isApiConfigured } from '@/shared/utils/httpClient'
import type { AiEnhanceClient } from './aiEnhanceClient.types'
import { createMockAiEnhanceClient } from './aiEnhanceClient.mock'
import { createRealAiEnhanceClient } from './aiEnhanceClient.real'

export function createAiEnhanceClient(accessToken?: string): AiEnhanceClient {
  return isApiConfigured() ? createRealAiEnhanceClient(accessToken) : createMockAiEnhanceClient()
}
