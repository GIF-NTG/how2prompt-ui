import type { AiModel } from '@/features/home/types'

export type { AiModel }

/** Create/edit payload — `id` is server/mock-assigned, `sortOrder` defaults to
 *  the end of the list when omitted on create. */
export interface AiModelUpsert {
  code: string
  name: string
  provider: string
  modelType: AiModel['modelType']
  description: string | null
  capabilities: Record<string, unknown>
  defaultConfig: Record<string, unknown>
  iconUrl: string | null
  isActive: boolean
  sortOrder: number
}

export interface AiModelsClient {
  /** Reuses the public `/ai-models` read endpoint — inactive models won't
   *  appear here (see `aiModelsClient.real.ts`). */
  list(): Promise<AiModel[]>
  create(input: AiModelUpsert): Promise<AiModel>
  update(id: string, input: AiModelUpsert): Promise<AiModel>
}
