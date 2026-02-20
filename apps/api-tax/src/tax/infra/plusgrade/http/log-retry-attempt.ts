import axios from 'axios'

import type { WithYear } from '@domain/types/with-year.type'
import type { AxiomLogger } from '@infra/axiom/logger'
import { LogLevel } from '@infra/axiom/log-level.enum'
import { TaxLogEvent } from '@infra/axiom/tax-log-event.enum'

export type LogRetryAttemptParams = {
  attempt: number
  error: unknown
  year: WithYear['year']
  isLastAttempt: boolean
  maxRetries: number
  retryBackoffMs: number
}

export function logRetryAttempt(
  params: LogRetryAttemptParams,
  logger: AxiomLogger
): void {
  const { attempt, error, year, isLastAttempt, maxRetries, retryBackoffMs } =
    params
  const backoffMs = attempt * retryBackoffMs

  void logger.log({
    event: TaxLogEvent.ExternalTaxApiRequestFailed,
    level: isLastAttempt ? LogLevel.Error : LogLevel.Warn,
    context: {
      year,
      attempt,
      maxRetries,
      isLastAttempt,
      backoffMs,
      statusCode: axios.isAxiosError(error)
        ? error.response?.status
        : undefined,
      errorCode: axios.isAxiosError(error) ? error.code : undefined
    }
  })
}
