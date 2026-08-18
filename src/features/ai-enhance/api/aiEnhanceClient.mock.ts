import { ApiError } from '@/shared/utils/httpClient'
import type {
  AiEnhanceClient,
  PlaygroundRunInput,
  PublicSharedPrompt,
  ShareResult,
} from './aiEnhanceClient.types'

const pendingRefinements = new Map<string, string>()
const shares = new Map<string, { slug: string; hideInputs: boolean; finalPrompt: string }>()

function fakeSlug(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function createMockAiEnhanceClient(): AiEnhanceClient {
  return {
    async refine(generatedPromptId) {
      const original = 'Write a short story about a robot.'
      const refined = 'Write a 500-word short story about a robot learning empathy.'
      pendingRefinements.set(generatedPromptId, refined)
      return {
        promptId: generatedPromptId,
        originalPrompt: original,
        refinedPrompt: refined,
        explanations: ['Added a word-count constraint.', 'Gave the robot a concrete arc.'],
        modelVersion: 'mock-refine-v1',
      }
    },

    async acceptRefine(generatedPromptId) {
      if (!pendingRefinements.has(generatedPromptId)) {
        throw new ApiError('NO_PENDING_REFINEMENT', 'No pending refinement to accept.', 422)
      }
      pendingRefinements.delete(generatedPromptId)
    },

    async discardRefine(generatedPromptId) {
      if (!pendingRefinements.has(generatedPromptId)) {
        throw new ApiError('NO_PENDING_REFINEMENT', 'No pending refinement to discard.', 422)
      }
      pendingRefinements.delete(generatedPromptId)
    },

    async score(generatedPromptId) {
      return {
        promptId: generatedPromptId,
        score: 8,
        breakdown: { clarity: 8, specificity: 7, context: 8, format: 9 },
        suggestions: ['Add an explicit output format.', 'Specify the target audience.'],
        modelVersion: 'mock-score-v1',
      }
    },

    async translate(generatedPromptId, targetLanguage) {
      return {
        promptId: generatedPromptId,
        originalPrompt: 'Write a short story about a robot.',
        translatedPrompt: `[${targetLanguage}] Write a short story about a robot.`,
        sourceLanguage: 'en',
        targetLanguage,
        modelVersion: 'mock-translate-v1',
      }
    },

    async runPlayground(input: PlaygroundRunInput) {
      const maxOutputTokens = input.maxOutputTokens ?? 4096
      return {
        promptId: input.generatedPromptId ?? `pg-${fakeSlug()}`,
        response: `Mock response for: ${input.prompt.slice(0, 60)}`,
        tokensUsed: { input: Math.ceil(input.prompt.length / 4), output: 42 },
        latencyMs: 1200,
        modelVersion: 'mock-playground-v1',
        truncated: false,
        effectiveTemperature: input.temperature ?? 0.7,
        effectiveMaxOutputTokens: maxOutputTokens,
      }
    },

    async share(generatedPromptId, hideInputs = false): Promise<ShareResult> {
      const slug = fakeSlug()
      shares.set(generatedPromptId, {
        slug,
        hideInputs,
        finalPrompt: 'Write a short story about a robot.',
      })
      return { share_slug: slug, is_public: true, hide_inputs: hideInputs }
    },

    async unshare(generatedPromptId) {
      shares.delete(generatedPromptId)
    },

    async getPublicSharedPrompt(slug): Promise<PublicSharedPrompt> {
      const entry = [...shares.values()].find((s) => s.slug === slug)
      if (!entry) {
        throw new ApiError('NOT_FOUND', 'Shared prompt not found.', 404)
      }
      const result: PublicSharedPrompt = {
        final_prompt: entry.finalPrompt,
        created_at: new Date().toISOString(),
      }
      if (!entry.hideInputs) {
        result.input_values = { topic: 'a robot' }
      }
      return result
    },
  }
}
