import { ApiError } from '@/shared/utils/httpClient'
import type { GenerateClient } from './generateClient.types'

/** Sentinel values for `extraInstructions` that trigger a simulated failure path
 *  in dev/testing, mirroring the real backend's error envelope via `ApiError`. */
export const MOCK_GENERATE_TRIGGERS = {
  quotaExceeded: '__mock_guest_quota_exceeded__',
  genericFailure: '__mock_generic_failure__',
} as const

const MOCK_PROMPT_BODY =
  'Với vai trò {{role}}, hãy debug đoạn log sau:\n\n{{log}}\n\nYêu cầu:\n1. Chỉ ra nguyên nhân gốc\n2. Gợi ý fix cụ thể\n3. Kiểm tra edge case liên quan'

function substitutePlaceholders(
  template: string,
  inputValues: Record<string, unknown>,
): string {
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
    async generate(_templateId, request) {
      if (request.extraInstructions === MOCK_GENERATE_TRIGGERS.quotaExceeded) {
        throw new ApiError(
          'GUEST_QUOTA_EXCEEDED',
          'Bạn đã đạt giới hạn tạo prompt miễn phí hôm nay.',
          429,
        )
      }
      if (request.extraInstructions === MOCK_GENERATE_TRIGGERS.genericFailure) {
        throw new ApiError('INTERNAL_ERROR', 'Đã có lỗi xảy ra, vui lòng thử lại.', 500)
      }

      const rendered = substitutePlaceholders(MOCK_PROMPT_BODY, request.inputValues)
      const extra = request.extraInstructions?.trim()
      const finalPrompt = extra ? `${rendered}\n\n${extra}` : rendered
      return {
        generatedPromptId: accessToken ? crypto.randomUUID() : null,
        finalPrompt,
        tokensEstimate: Math.ceil(finalPrompt.split(/\s+/).length * 1.3),
        aiModelCode: request.aiModelCode,
        remainingQuota: accessToken ? null : 2,
      }
    },
  }
}
