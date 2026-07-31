import { MOCK_MODELS } from '@/features/home/api/templateClient.mock'
import type { AiModel } from '@/features/home/types'
import type { AiModelsClient, AiModelUpsert } from './aiModelsClient.types'

let nextId = 1000

/** `defaultConfig` only exists on the upsert payload (data-model.md) — the
 *  read-side `AiModel` shape doesn't carry it. */
function toAiModel(id: string, input: AiModelUpsert): AiModel {
  const { defaultConfig: _defaultConfig, ...rest } = input
  return { id, ...rest }
}

export function createMockAiModelsClient(): AiModelsClient {
  return {
    async list() {
      return [...MOCK_MODELS]
    },

    async create(input) {
      const created = toAiModel(`m${nextId++}`, input)
      MOCK_MODELS.push(created)
      return created
    },

    async update(id, input) {
      const index = MOCK_MODELS.findIndex((m) => m.id === id)
      if (index === -1) {
        throw new Error(`AI model ${id} not found`)
      }
      const updated = toAiModel(id, input)
      MOCK_MODELS[index] = updated
      return updated
    },
  }
}
