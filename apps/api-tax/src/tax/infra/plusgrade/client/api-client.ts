import { Injectable } from '@nestjs/common'
import type { AxiosInstance } from 'axios'

import { AxiomLogger } from '@infra/axiom/logger'
import { EnvFlag } from '@infra/env/env.flag.enum'
import { EnvService } from '@infra/env/env.service'

import type { WithYear } from '@domain/types/with-year.type'

import type { ExternalTaxBracket } from '@infra/plusgrade/types'
import { createHttpClient } from '@infra/plusgrade/transport/create-http-client'
import { fetchTaxBracketsForYear } from '@infra/plusgrade/fetch/fetch-tax-brackets-for-year'
import { getStableTaxBrackets } from '@infra/plusgrade/fetch/get-stable-tax-brackets'
import { logRetryAttempt } from '@infra/plusgrade/logging/log-retry-attempt'
import { throwExternalError } from '@infra/plusgrade/errors/throw-external-error'
import { FALLBACK_TAX_YEAR } from '@infra/plusgrade/types'

@Injectable()
export class ExternalTaxApiClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly maxRetries: number
  private readonly retryBackoffMs: number
  private readonly http: AxiosInstance

  constructor(
    env: EnvService,
    private readonly axiomLogger: AxiomLogger
  ) {
    this.baseUrl = env.requireString(EnvFlag.PlusgradeTaxApiBaseUrl)
    this.timeoutMs = env.requireNumber(EnvFlag.PlusgradeApiTimeoutMs)
    this.maxRetries = env.requireNumber(EnvFlag.PlusgradeApiMaxRetries)
    this.retryBackoffMs = env.requireNumber(EnvFlag.PlusgradeApiRetryBackoffMs)
    this.http = createHttpClient({
      baseUrl: this.baseUrl,
      timeoutMs: this.timeoutMs,
      maxRetries: this.maxRetries,
      retryBackoffMs: this.retryBackoffMs,
      onRetry: (params) => logRetryAttempt(params, this.axiomLogger)
    })
  }

  async getTaxBrackets(year: WithYear['year']): Promise<ExternalTaxBracket[]> {
    try {
      return await fetchTaxBracketsForYear(this.http, this.baseUrl, year)
    } catch (error) {
      this.logFinalFailure(error, year)
      if (year === FALLBACK_TAX_YEAR) {
        return getStableTaxBrackets(this.http, this.baseUrl, this.axiomLogger)
      }
      throwExternalError(error, year)
    }
  }

  private logFinalFailure(error: unknown, year: WithYear['year']): void {
    logRetryAttempt(
      {
        attempt: this.maxRetries,
        error,
        year,
        isLastAttempt: true,
        maxRetries: this.maxRetries,
        retryBackoffMs: this.retryBackoffMs
      },
      this.axiomLogger
    )
  }
}
