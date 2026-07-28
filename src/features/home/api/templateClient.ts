import type { TemplateClient } from './templateClient.types'
import { createMockTemplateClient } from './templateClient.mock'
import { createRealTemplateClient } from './templateClient.real'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const templateClient: TemplateClient = API_BASE_URL
  ? createRealTemplateClient()
  : createMockTemplateClient()
