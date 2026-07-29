export interface AiModel {
  id: string
  code: string
  name: string
  provider: string
  modelType: 'text' | 'image' | 'video' | 'audio' | 'multimodal'
  description: string | null
  capabilities: Record<string, unknown>
  iconUrl: string | null
  isActive: boolean
  sortOrder: number
}

export interface AiModelUpsert {
  code: string
  name: string
  provider: string
  modelType: 'text' | 'image' | 'video' | 'audio' | 'multimodal'
  description?: string
  capabilities?: Record<string, unknown>
  defaultConfig?: Record<string, unknown>
  iconUrl?: string
  isActive?: boolean
  sortOrder?: number
}

export interface AiModelsClient {
  /** Lists every model, including inactive ones — the admin-only view. */
  listAll(accessToken: string): Promise<AiModel[]>
  create(accessToken: string, input: AiModelUpsert): Promise<AiModel>
  update(accessToken: string, id: string, input: AiModelUpsert): Promise<AiModel>
}
