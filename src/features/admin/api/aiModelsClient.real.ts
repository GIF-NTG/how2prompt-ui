import { apiFetch } from '@/shared/utils/httpClient'
import type { AiModel } from '@/features/home/types'
import type { AiModelsClient } from './aiModelsClient.types'

export function createRealAiModelsClient(accessToken?: string): AiModelsClient {
  return {
    async list() {
      return apiFetch<AiModel[]>('/admin/ai-models', { accessToken })
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
