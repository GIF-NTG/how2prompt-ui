import { apiFetch } from '@/shared/utils/httpClient'
import type { GenerateClient, GenerateResponse } from './generateClient.types'
import { getGuestFingerprint } from '../utils/guestFingerprint'

export function createRealGenerateClient(accessToken?: string): GenerateClient {
  return {
    async generate(templateId, request) {
      const headers: Record<string, string> = {}
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      } else {
        headers['X-Guest-Fingerprint'] = getGuestFingerprint()
      }

      return apiFetch<GenerateResponse>(`/templates/${templateId}/generate`, {
        method: 'POST',
        body: request,
        accessToken,
      })
    },
  }
}
