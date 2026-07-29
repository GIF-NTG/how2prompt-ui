import type { TaxonomyClient } from './taxonomyClient.types'
import { createMockTaxonomyClient } from './taxonomyClient.mock'
import { createRealTaxonomyClient } from './taxonomyClient.real'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const taxonomyClient: TaxonomyClient = API_BASE_URL
  ? createRealTaxonomyClient()
  : createMockTaxonomyClient()
