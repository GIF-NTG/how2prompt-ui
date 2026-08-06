import { ApiError } from '@/shared/utils/httpClient'
import type { GenerateClient } from './generateClient.types'
import { recordGeneratedPrompt } from '@/features/history/api/historyClient.mock'
import type { HistoryDetail } from '@/features/history/types'

/** Sentinel values for `extraInstructions` that trigger a simulated failure path
 *  in dev/testing, mirroring the real backend's error envelope via `ApiError`. */
export const MOCK_GENERATE_TRIGGERS = {
  quotaExceeded: '__mock_guest_quota_exceeded__',
  genericFailure: '__mock_generic_failure__',
} as const

const MOCK_PROMPT_BODY =
  'As a {{role}}, debug the following log:\n\n{{log}}\n\nRequirements:\n1. Identify the root cause\n2. Suggest a specific fix\n3. Check related edge cases'

function substitutePlaceholders(template: string, inputValues: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = inputValues[key]
    if (value === undefined || value === null || value === '') {
      return match
    }
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return String(value)
  })
}

export function createMockGenerateClient(accessToken?: string): GenerateClient {
  return {
    async generate(templateId, request) {
      if (request.extraInstructions === MOCK_GENERATE_TRIGGERS.quotaExceeded) {
        throw new ApiError(
          'GUEST_QUOTA_EXCEEDED',
          'You have reached today\'s free prompt generation limit.',
          429,
        )
      }
      if (request.extraInstructions === MOCK_GENERATE_TRIGGERS.genericFailure) {
        throw new ApiError('INTERNAL_ERROR', 'Something went wrong, please try again.', 500)
      }

      const rendered = substitutePlaceholders(MOCK_PROMPT_BODY, request.inputValues)
      const extra = request.extraInstructions?.trim()
      const finalPrompt = extra ? `${rendered}\n\n${extra}` : rendered
      const generatedPromptId = accessToken ? crypto.randomUUID() : null

      // US2 (FR-001/FR-002): the real backend auto-saves history within the
      // same generate transaction — mirror that here so the mock environment
      // demonstrates the same end-to-end behavior. Guests (no accessToken,
      // no generatedPromptId) never get a history record.
      if (generatedPromptId) {
        const entry: HistoryDetail = {
          id: generatedPromptId,
          title: null,
          templateId,
          templateTitle: { en: templateId, vi: templateId },
          aiModelCode: request.aiModelCode,
          promptSnippet: finalPrompt.slice(0, 150),
          createdAt: new Date().toISOString(),
          templateVersionId: request.templateVersionId ?? null,
          inputValues: request.inputValues,
          extraInstructions: request.extraInstructions ?? null,
          finalPrompt,
        }
        recordGeneratedPrompt(entry)
      }

      return {
        generatedPromptId,
        finalPrompt,
        tokensEstimate: Math.ceil(finalPrompt.split(/\s+/).length * 1.3),
        aiModelCode: request.aiModelCode,
        remainingQuota: accessToken ? null : 2,
      }
    },
  }
}
