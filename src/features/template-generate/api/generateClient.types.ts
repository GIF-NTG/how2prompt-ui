export interface GenerateRequest {
  templateVersionId?: string
  aiModelCode: string
  inputValues: Record<string, unknown>
  extraInstructions?: string | null
  title?: string | null
}

export interface GenerateResponse {
  generatedPromptId: string | null
  finalPrompt: string
  tokensEstimate: number
  aiModelCode: string
  remainingQuota: number | null
}

export interface GenerateClient {
  generate(templateId: string, request: GenerateRequest): Promise<GenerateResponse>
}
