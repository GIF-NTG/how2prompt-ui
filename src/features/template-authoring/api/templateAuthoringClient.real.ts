import { apiFetch } from '@/shared/utils/httpClient'
import type { TemplateAuthoringResponse, TemplateVersionSummary } from '../types'
import type { TemplateAuthoringClient } from './templateAuthoringClient.types'

export function createRealTemplateAuthoringClient(accessToken?: string): TemplateAuthoringClient {
  return {
    async create(input) {
      return apiFetch<TemplateAuthoringResponse>('/templates', {
        method: 'POST',
        body: input,
        accessToken,
      })
    },

    async fork(templateId) {
      return apiFetch<TemplateAuthoringResponse>(`/templates/${templateId}/fork`, {
        method: 'POST',
        accessToken,
      })
    },

    async edit(templateId, input) {
      return apiFetch<TemplateAuthoringResponse>(`/templates/${templateId}`, {
        method: 'PATCH',
        body: input,
        accessToken,
      })
    },

    async listVersions(templateId) {
      return apiFetch<TemplateVersionSummary[]>(`/templates/${templateId}/versions`, {
        accessToken,
      })
    },

    async diffVersions(templateId, fromVersionId, toVersionId) {
      const query = new URLSearchParams({ from: fromVersionId, to: toVersionId })
      return apiFetch(`/templates/${templateId}/versions/diff?${query.toString()}`, {
        accessToken,
      })
    },

    async setCurrentVersion(templateId, versionId) {
      return apiFetch<TemplateAuthoringResponse>(
        `/templates/${templateId}/versions/${versionId}/current`,
        { method: 'PATCH', accessToken },
      )
    },

    async archiveVersion(templateId, versionId) {
      return apiFetch<TemplateVersionSummary>(
        `/templates/${templateId}/versions/${versionId}/archive`,
        { method: 'PATCH', accessToken },
      )
    },

    async submit(templateId) {
      return apiFetch(`/templates/${templateId}/submit`, { method: 'POST', accessToken })
    },
  }
}
