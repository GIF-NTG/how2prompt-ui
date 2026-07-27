import type { TemplateDetailClient } from './templateDetailClient.types'
import { createMockTemplateDetailClient } from './templateDetailClient.mock'
import { createRealTemplateDetailClient } from './templateDetailClient.real'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const templateDetailClient: TemplateDetailClient = API_BASE_URL
  ? createRealTemplateDetailClient()
  : createMockTemplateDetailClient()
