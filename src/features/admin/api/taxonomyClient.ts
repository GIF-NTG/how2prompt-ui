import { isApiConfigured } from '@/shared/utils/httpClient'
import type { TaxonomyClient } from './taxonomyClient.types'
import { createMockTaxonomyClient } from './taxonomyClient.mock'
import { createRealTaxonomyClient } from './taxonomyClient.real'

export function createTaxonomyClient(accessToken?: string): TaxonomyClient {
  return isApiConfigured()
    ? createRealTaxonomyClient(accessToken)
    : createMockTaxonomyClient()
}
