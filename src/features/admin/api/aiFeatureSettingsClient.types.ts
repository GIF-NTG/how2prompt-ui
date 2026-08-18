export type AiFeature = 'REFINE' | 'SCORE' | 'TRANSLATE'

export interface AiFeatureSetting {
  feature: AiFeature
  aiModelId: string
  updatedAt: string
  updatedBy: string
}

export interface AiFeatureSettingsClient {
  list(): Promise<AiFeatureSetting[]>
  update(feature: AiFeature, aiModelId: string): Promise<AiFeatureSetting>
}
