import { BadGatewayException } from '@nestjs/common'
import type { AxiosInstance } from 'axios'

import type { WithYear } from '@domain/types/with-year.type'
import type {
  ExternalTaxBracket,
  ExternalTaxBracketsResponse,
  TaxRequestConfig
} from './external-tax-api.types'
import { TAX_CONTEXT_KEY } from './external-tax-api.types'

export async function fetchTaxBracketsForYear(
  http: AxiosInstance,
  baseUrl: string,
  year: WithYear['year']
): Promise<ExternalTaxBracket[]> {
  const config: TaxRequestConfig = { [TAX_CONTEXT_KEY]: { year } }
  const { data } = await http.get<ExternalTaxBracketsResponse>(
    `${baseUrl}/tax-calculator/tax-year/${year}`,
    config
  )
  if (!Array.isArray(data.tax_brackets)) {
    throw new BadGatewayException('Invalid tax brackets payload')
  }
  return data.tax_brackets
}
