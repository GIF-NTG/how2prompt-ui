import { createMockAuthClient } from './authClient.mock'

export type { AuthClient } from './authClient.types'

/**
 * The one place that decides which AuthClient implementation is active.
 * Swap this line for a real implementation once a backend exists — no other
 * file in src/features/auth or src/shared should need to change (SC-004).
 */
export const authClient = createMockAuthClient()
