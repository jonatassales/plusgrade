import { BadGatewayException } from '@nestjs/common'
import type { AxiosInstance } from 'axios'

import type { AxiomLogger } from '@infra/axiom/logger'
import { LogLevel } from '@infra/axiom/log-level.enum'
import { TaxLogEvent } from '@infra/axiom/tax-log-event.enum'

import type {
  ExternalTaxBracket,
  ExternalTaxBracketsResponse
} from './external-tax-api.types'
import { TAX_CONTEXT_KEY } from './external-tax-api.types'
import type { TaxRequestConfig } from './external-tax-api.types'
import { throwExternalError } from './throw-external-error'

export async function getStableTaxBrackets(
  http: AxiosInstance,
  baseUrl: string,
  logger: AxiomLogger
): Promise<ExternalTaxBracket[]> {
  try {
    const config: TaxRequestConfig = { [TAX_CONTEXT_KEY]: { year: 2022 } }
    const { data } = await http.get<ExternalTaxBracketsResponse>(
      `${baseUrl}/tax-calculator/`,
      config
    )
    if (!Array.isArray(data.tax_brackets)) {
      throw new BadGatewayException('Invalid fallback tax brackets payload')
    }
    void logger.log({
      event: TaxLogEvent.ExternalTaxApiFallbackUsed,
      level: LogLevel.Warn,
      context: { year: 2022 }
    })
    return data.tax_brackets
  } catch (error) {
    throwExternalError(error, 2022)
  }
}
