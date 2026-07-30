import type { AiModel, AiModelUpsert, AiModelsClient } from './aiModelsClient.types'
import { apiFetch } from '@/shared/utils/httpClient'

/**
 * Real implementation against docs/api/openapi.yaml's /admin/ai-models endpoints
 * (contracts/admin-api.md). No delete endpoint exists — see research.md Decision 3;
 * `update()` with `isActive: false` is the only removal affordance.
 */
export function createRealAiModelsClient(): AiModelsClient {
  return {
    async listAll(accessToken: string) {
      return apiFetch<AiModel[]>('/admin/ai-models', { accessToken })
    },
    async create(accessToken: string, input: AiModelUpsert) {
      return apiFetch<AiModel>('/admin/ai-models', { method: 'POST', accessToken, body: input })
    },
    async update(accessToken: string, id: string, input: AiModelUpsert) {
      return apiFetch<AiModel>(`/admin/ai-models/${id}`, {
        method: 'PATCH',
        accessToken,
        body: input,
      })
    },
  }
}
