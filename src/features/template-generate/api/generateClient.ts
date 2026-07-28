import type { GenerateClient } from './generateClient.types'
import { createMockGenerateClient } from './generateClient.mock'
import { createRealGenerateClient } from './generateClient.real'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function createGenerateClient(accessToken?: string): GenerateClient {
  return API_BASE_URL ? createRealGenerateClient(accessToken) : createMockGenerateClient()
}
