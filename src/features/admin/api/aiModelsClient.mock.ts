import type { AiModel, AiModelUpsert, AiModelsClient } from './aiModelsClient.types'

// Seeded so quickstart.md §2's "model referenced by a template" scenario is
// exercisable without a real backend — m1/m2 mirror the codes the home feature's
// mock template client already uses (research.md Decision 4 — clients are
// independent per feature, but fixtures stay consistent in spirit).
let mockModels: AiModel[] = [
  {
    id: 'm1',
    code: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelType: 'text',
    description: 'Model đa năng của OpenAI.',
    capabilities: { vision: true, contextWindow: 128000 },
    iconUrl: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'm2',
    code: 'claude',
    name: 'Claude',
    provider: 'anthropic',
    modelType: 'text',
    description: 'Model của Anthropic.',
    capabilities: { vision: true, contextWindow: 200000 },
    iconUrl: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'm3',
    code: 'gemini',
    name: 'Gemini',
    provider: 'google',
    modelType: 'text',
    description: null,
    capabilities: {},
    iconUrl: null,
    isActive: false,
    sortOrder: 3,
  },
]

function createId(): string {
  return `m.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`
}

export function createMockAiModelsClient(): AiModelsClient {
  return {
    async listAll() {
      return [...mockModels].sort((a, b) => a.sortOrder - b.sortOrder)
    },
    async create(_accessToken: string, input: AiModelUpsert) {
      const model: AiModel = {
        id: createId(),
        code: input.code,
        name: input.name,
        provider: input.provider,
        modelType: input.modelType,
        description: input.description ?? null,
        capabilities: input.capabilities ?? {},
        iconUrl: input.iconUrl ?? null,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? mockModels.length + 1,
      }
      mockModels = [...mockModels, model]
      return model
    },
    async update(_accessToken: string, id: string, input: AiModelUpsert) {
      let updated: AiModel | undefined
      mockModels = mockModels.map((model) => {
        if (model.id !== id) return model
        updated = {
          ...model,
          code: input.code,
          name: input.name,
          provider: input.provider,
          modelType: input.modelType,
          description: input.description ?? model.description,
          capabilities: input.capabilities ?? model.capabilities,
          iconUrl: input.iconUrl ?? model.iconUrl,
          isActive: input.isActive ?? model.isActive,
          sortOrder: input.sortOrder ?? model.sortOrder,
        }
        return updated
      })
      if (!updated) throw new Error(`AI model ${id} not found`)
      return updated
    },
  }
}
