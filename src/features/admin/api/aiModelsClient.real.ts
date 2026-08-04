import { apiFetch } from '@/shared/utils/httpClient'
import type { AiModel } from '@/features/home/types'
import type { AiModelsClient } from './aiModelsClient.types'

/** Reuses the public `/ai-models` read endpoint (same as the home page,
 *  `home/api/templateClient.real.ts`'s `getModels`) — `/admin/ai-models` is
 *  only used for create/update below. Trade-off: inactive models won't show
 *  up here until reactivated some other way, since the public list hides
 *  them (same limitation already accepted for admin templates/drafts). */
export function createRealAiModelsClient(accessToken?: string): AiModelsClient {
  return {
    async list() {
      return apiFetch<AiModel[]>('/ai-models')
    },

    async create(input) {
      return apiFetch<AiModel>('/admin/ai-models', { method: 'POST', body: input, accessToken })
    },

    async update(id, input) {
      return apiFetch<AiModel>(`/admin/ai-models/${id}`, {
        method: 'PATCH',
        body: input,
        accessToken,
      })
    },
  }
}
