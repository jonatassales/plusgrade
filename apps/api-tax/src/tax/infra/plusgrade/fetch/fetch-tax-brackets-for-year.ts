import type { AxiosInstance } from 'axios'

import type { WithYear } from '@domain/types/with-year.type'

import type {
  ExternalTaxBracket,
  ExternalTaxBracketsResponse
} from '@infra/plusgrade/types'
import { buildTaxRequestConfig } from '@infra/plusgrade/fetch/build-request-config'
import { validateTaxBracketsResponse } from '@infra/plusgrade/fetch/validate-tax-brackets-response'

const INVALID_PAYLOAD_MESSAGE = 'Invalid tax brackets payload'

/**
 * Fetches tax brackets for a given year from the external tax API.
 */
export async function fetchTaxBracketsForYear(
  http: AxiosInstance,
  baseUrl: string,
  year: WithYear['year']
): Promise<ExternalTaxBracket[]> {
  const config = buildTaxRequestConfig(year)
  const { data } = await http.get<ExternalTaxBracketsResponse>(
    `${baseUrl}/tax-calculator/tax-year/${year}`,
    config
  )
  return validateTaxBracketsResponse(data, INVALID_PAYLOAD_MESSAGE)
}
