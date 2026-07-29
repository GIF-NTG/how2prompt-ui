import type { HistoryClient } from './historyClient.types'
import { createMockHistoryClient } from './historyClient.mock'
import { createRealHistoryClient } from './historyClient.real'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/** History/favorites endpoints all require an authenticated User (per
 *  contracts/history-favorites.md) — a factory taking the current
 *  `accessToken`, mirroring `createGenerateClient`'s pattern, rather than
 *  `templateClient.ts`'s unauthenticated singleton. */
export function createHistoryClient(accessToken?: string): HistoryClient {
  return API_BASE_URL ? createRealHistoryClient(accessToken) : createMockHistoryClient()
}
