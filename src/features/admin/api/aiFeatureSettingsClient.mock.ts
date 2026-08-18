import { ApiError } from '@/shared/utils/httpClient'
import type {
  AiFeature,
  AiFeatureSetting,
  AiFeatureSettingsClient,
} from './aiFeatureSettingsClient.types'

const store = new Map<AiFeature, AiFeatureSetting>([
  [
    'REFINE',
    { feature: 'REFINE', aiModelId: 'm1', updatedAt: '2026-07-01T00:00:00Z', updatedBy: 'admin' },
  ],
  [
    'SCORE',
    { feature: 'SCORE', aiModelId: 'm1', updatedAt: '2026-07-01T00:00:00Z', updatedBy: 'admin' },
  ],
  [
    'TRANSLATE',
    {
      feature: 'TRANSLATE',
      aiModelId: 'm2',
      updatedAt: '2026-07-01T00:00:00Z',
      updatedBy: 'admin',
    },
  ],
])

export function createMockAiFeatureSettingsClient(): AiFeatureSettingsClient {
  return {
    async list() {
      return [...store.values()]
    },

    async update(feature, aiModelId) {
      if (!store.has(feature)) {
        throw new ApiError('BAD_REQUEST', `Unknown AI feature: ${feature}`, 400)
      }
      const updated: AiFeatureSetting = {
        feature,
        aiModelId,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin',
      }
      store.set(feature, updated)
      return updated
    },
  }
}
