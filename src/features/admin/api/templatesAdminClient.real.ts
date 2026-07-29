import type { Template, TemplateUpsert, TemplatesAdminClient } from './templatesAdminClient.types'
import { PublishValidationError } from './templatesAdminClient.types'
import { apiFetch, ApiError } from '@/shared/utils/httpClient'

/**
 * Real implementation against docs/api/openapi.yaml's /admin/templates endpoints
 * (contracts/admin-api.md). `publish()` maps the documented 422 (placeholder with
 * no matching variable) into PublishValidationError.
 *
 * `list()` has no dedicated admin listing endpoint in the contract — it falls back
 * to the public `GET /templates` read, which per docs/api/openapi.yaml only
 * returns published, non-deleted templates. Drafts an admin hasn't published yet
 * will not appear here; this is a known contract gap (in the spirit of
 * research.md Decision 3), not a bug in this client.
 */
export function createRealTemplatesAdminClient(): TemplatesAdminClient {
  return {
    async create(accessToken: string, input: TemplateUpsert) {
      return apiFetch<Template>('/admin/templates', { method: 'POST', accessToken, body: input })
    },
    async update(accessToken: string, id: string, input: TemplateUpsert) {
      return apiFetch<Template>(`/admin/templates/${id}`, { method: 'PATCH', accessToken, body: input })
    },
    async publish(accessToken: string, id: string) {
      try {
        return await apiFetch<Template>(`/admin/templates/${id}/publish`, {
          method: 'POST',
          accessToken,
        })
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          const missing = Object.keys(error.details ?? {})
          throw new PublishValidationError(missing)
        }
        throw error
      }
    },
    async list() {
      const response = await apiFetch<{ data: Template[] }>('/templates')
      return response.data
    },
  }
}
