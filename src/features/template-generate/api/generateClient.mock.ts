import type { GenerateClient } from './generateClient.types'

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

export function createMockGenerateClient(): GenerateClient {
  return {
    async generate(_templateId, request) {
      const finalPrompt = substitutePlaceholders(MOCK_PROMPT_BODY, request.inputValues)
      return {
        generatedPromptId: null,
        finalPrompt,
        tokensEstimate: Math.ceil(finalPrompt.split(/\s+/).length * 1.3),
        aiModelCode: request.aiModelCode,
        remainingQuota: 47,
      }
    },
  }
}
