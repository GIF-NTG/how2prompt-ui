import { isApiConfigured } from '@/shared/utils/httpClient'
import type { AiFeatureSettingsClient } from './aiFeatureSettingsClient.types'
import { createMockAiFeatureSettingsClient } from './aiFeatureSettingsClient.mock'
import { createRealAiFeatureSettingsClient } from './aiFeatureSettingsClient.real'

export function createAiFeatureSettingsClient(accessToken?: string): AiFeatureSettingsClient {
  return isApiConfigured()
    ? createRealAiFeatureSettingsClient(accessToken)
    : createMockAiFeatureSettingsClient()
}
