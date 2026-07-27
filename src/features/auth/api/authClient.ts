import { createMockAuthClient } from './authClient.mock'
import { createRealAuthClient } from './authClient.real'
import { isApiConfigured } from '@/shared/utils/httpClient'

export type { AuthClient } from './authClient.types'

/**
 * The one place that decides which AuthClient implementation is active.
 * Set VITE_API_BASE_URL (see .env.example) to switch to the real backend
 * (docs/api/openapi.yaml) — no other file in src/features/auth or src/shared
 * needs to change (SC-004).
 */
export const authClient = isApiConfigured() ? createRealAuthClient() : createMockAuthClient()
