import type { AxiosInstance } from 'axios'

import type { AxiomLogger } from '@infra/axiom/logger'
import { LogLevel } from '@infra/axiom/log-level.enum'
import { TaxLogEvent } from '@infra/axiom/tax-log-event.enum'

import type {
  ExternalTaxBracket,
  ExternalTaxBracketsResponse
} from '@infra/plusgrade/types'
import { FALLBACK_TAX_YEAR } from '@infra/plusgrade/types'
import { throwExternalError } from '@infra/plusgrade/errors/throw-external-error'
import { buildTaxRequestConfig } from '@infra/plusgrade/fetch/build-request-config'
import { validateTaxBracketsResponse } from '@infra/plusgrade/fetch/validate-tax-brackets-response'

const FALLBACK_INVALID_PAYLOAD_MESSAGE = 'Invalid fallback tax brackets payload'

function logFallbackUsed(logger: AxiomLogger): void {
  void logger.log({
    event: TaxLogEvent.ExternalTaxApiFallbackUsed,
    level: LogLevel.Warn,
    context: { year: FALLBACK_TAX_YEAR }
  })
}

/**
 * Fetches stable (fallback) tax brackets when the year-specific endpoint fails.
 */
export async function getStableTaxBrackets(
  http: AxiosInstance,
  baseUrl: string,
  logger: AxiomLogger
): Promise<ExternalTaxBracket[]> {
  try {
    const config = buildTaxRequestConfig(FALLBACK_TAX_YEAR)
    const { data } = await http.get<ExternalTaxBracketsResponse>(
      `${baseUrl}/tax-calculator/`,
      config
    )
    const brackets = validateTaxBracketsResponse(
      data,
      FALLBACK_INVALID_PAYLOAD_MESSAGE
    )
    logFallbackUsed(logger)
    return brackets
  } catch (error) {
    throwExternalError(error, FALLBACK_TAX_YEAR)
  }
}
