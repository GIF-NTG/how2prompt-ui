import { apiFetch } from '@/shared/utils/httpClient'
import type { AdminTemplate, TemplatesAdminClient } from './templatesAdminClient.types'

/** No `GET /admin/templates` list endpoint is documented in
 *  `contracts/admin-api.md` — this client only exposes the create/update/
 *  publish operations the contract actually supports. */
export function createRealTemplatesAdminClient(accessToken?: string): TemplatesAdminClient {
  return {
    async list() {
      return []
    },

    async create(input) {
      return apiFetch<AdminTemplate>('/admin/templates', {
        method: 'POST',
        body: input,
        accessToken,
      })
    },

    async update(id, input) {
      return apiFetch<AdminTemplate>(`/admin/templates/${id}`, {
        method: 'PATCH',
        body: input,
        accessToken,
      })
    },

    async publish(id) {
      return apiFetch<AdminTemplate>(`/admin/templates/${id}/publish`, {
        method: 'POST',
        accessToken,
      })
    },
  }
}
