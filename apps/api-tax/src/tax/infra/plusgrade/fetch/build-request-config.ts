import type { WithYear } from '@domain/types/with-year.type'

import type { TaxRequestConfig } from '@infra/plusgrade/types'
import { TAX_CONTEXT_KEY } from '@infra/plusgrade/types'

/**
 * Builds Axios request config with tax context for retry logging.
 */
export function buildTaxRequestConfig(
  year: WithYear['year']
): TaxRequestConfig {
  return { [TAX_CONTEXT_KEY]: { year } }
}
