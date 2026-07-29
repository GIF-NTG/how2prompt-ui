import type { AiModelsClient } from './aiModelsClient.types'
import { createMockAiModelsClient } from './aiModelsClient.mock'
import { createRealAiModelsClient } from './aiModelsClient.real'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const aiModelsClient: AiModelsClient = API_BASE_URL
  ? createRealAiModelsClient()
  : createMockAiModelsClient()
