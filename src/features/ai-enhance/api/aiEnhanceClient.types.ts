/** Epic 6 (AI Enhancement) DTOs — see docs/api/openapi.yaml's "AI Enhancement" tag. */

export interface RefineResult {
  promptId: string
  originalPrompt: string
  refinedPrompt: string
  explanations: string[]
  modelVersion: string
}

export interface ScoreBreakdown {
  clarity: number
  specificity: number
  context: number
  format: number
}

export interface ScoreResult {
  promptId: string
  score: number
  breakdown: ScoreBreakdown
  suggestions: string[]
  modelVersion: string
}

export interface TranslateResult {
  promptId: string
  originalPrompt: string
  translatedPrompt: string
  sourceLanguage: string
  targetLanguage: string
  modelVersion: string
}

export interface PlaygroundRunInput {
  prompt: string
  aiModelId: string
  generatedPromptId?: string
  temperature?: number
  maxOutputTokens?: number
}

export interface PlaygroundRunResult {
  promptId: string
  response: string
  tokensUsed: { input: number; output: number }
  latencyMs: number
  modelVersion: string
  truncated: boolean
  effectiveTemperature: number
  effectiveMaxOutputTokens: number
}

/** snake_case — deliberate exception, see docs/api/openapi.yaml's ShareResult schema. */
export interface ShareResult {
  share_slug: string
  is_public: boolean
  hide_inputs: boolean
}

/** Top-level snake_case, nested objects camelCase. `template`/`ai_model`/
 *  `input_values` are absent (not `null`) when the source prompt has none —
 *  check with `'template' in data`, not truthiness. */
export interface PublicSharedPrompt {
  final_prompt: string
  template?: { title: string; slug: string }
  ai_model?: { name: string; code: string }
  input_values?: Record<string, unknown>
  created_at: string
}

export interface AiEnhanceClient {
  refine(generatedPromptId: string, accessToken?: string): Promise<RefineResult>
  acceptRefine(
    generatedPromptId: string,
    acceptedPrompt?: string,
    accessToken?: string,
  ): Promise<void>
  discardRefine(generatedPromptId: string, accessToken?: string): Promise<void>
  score(generatedPromptId: string, accessToken?: string): Promise<ScoreResult>
  translate(
    generatedPromptId: string,
    targetLanguage: string,
    accessToken?: string,
  ): Promise<TranslateResult>
  runPlayground(input: PlaygroundRunInput, accessToken?: string): Promise<PlaygroundRunResult>
  share(generatedPromptId: string, hideInputs?: boolean, accessToken?: string): Promise<ShareResult>
  unshare(generatedPromptId: string, accessToken?: string): Promise<void>
  /** Public — no auth. */
  getPublicSharedPrompt(slug: string): Promise<PublicSharedPrompt>
}
