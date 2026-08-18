import { apiFetchRaw } from '@/shared/utils/httpClient'
import type { AiFeatureSetting, AiFeatureSettingsClient } from './aiFeatureSettingsClient.types'

/** Both endpoints return their raw object/array body — no `{data}` envelope,
 *  see docs/api/openapi.yaml's note on this Epic 6 exception. */
export function createRealAiFeatureSettingsClient(accessToken?: string): AiFeatureSettingsClient {
  return {
    async list() {
      return apiFetchRaw<AiFeatureSetting[]>('/admin/ai-feature-settings', { accessToken })
    },

    async update(feature, aiModelId) {
      return apiFetchRaw<AiFeatureSetting>(`/admin/ai-feature-settings/${feature}`, {
        method: 'PUT',
        body: { aiModelId },
        accessToken,
      })
    },
  }
}
