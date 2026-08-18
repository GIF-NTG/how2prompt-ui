import { apiFetch } from '@/shared/utils/httpClient'
import type {
  AiEnhanceClient,
  PlaygroundRunInput,
  PlaygroundRunResult,
  PublicSharedPrompt,
  RefineResult,
  ScoreResult,
  ShareResult,
  TranslateResult,
} from './aiEnhanceClient.types'

export function createRealAiEnhanceClient(accessToken?: string): AiEnhanceClient {
  return {
    async refine(generatedPromptId) {
      return apiFetch<RefineResult>(`/generated-prompts/${generatedPromptId}/refine`, {
        method: 'POST',
        accessToken,
      })
    },

    async acceptRefine(generatedPromptId, acceptedPrompt) {
      await apiFetch<void>(`/generated-prompts/${generatedPromptId}/refine/accept`, {
        method: 'POST',
        body: acceptedPrompt !== undefined ? { acceptedPrompt } : undefined,
        accessToken,
      })
    },

    async discardRefine(generatedPromptId) {
      await apiFetch<void>(`/generated-prompts/${generatedPromptId}/refine`, {
        method: 'DELETE',
        accessToken,
      })
    },

    async score(generatedPromptId) {
      return apiFetch<ScoreResult>(`/generated-prompts/${generatedPromptId}/score`, {
        method: 'POST',
        accessToken,
      })
    },

    async translate(generatedPromptId, targetLanguage) {
      return apiFetch<TranslateResult>(`/generated-prompts/${generatedPromptId}/translate`, {
        method: 'POST',
        body: { targetLanguage },
        accessToken,
      })
    },

    async runPlayground(input: PlaygroundRunInput) {
      return apiFetch<PlaygroundRunResult>('/playground/run', {
        method: 'POST',
        body: input,
        accessToken,
      })
    },

    async share(generatedPromptId, hideInputs) {
      return apiFetch<ShareResult>(`/generated-prompts/${generatedPromptId}/share`, {
        method: 'POST',
        body: hideInputs !== undefined ? { hideInputs } : undefined,
        accessToken,
      })
    },

    async unshare(generatedPromptId) {
      await apiFetch<void>(`/generated-prompts/${generatedPromptId}/share`, {
        method: 'DELETE',
        accessToken,
      })
    },

    async getPublicSharedPrompt(slug) {
      return apiFetch<PublicSharedPrompt>(`/public/prompts/${slug}`)
    },
  }
}
