import { Injectable } from '@nestjs/common'
import type { AxiosInstance } from 'axios'

import { AxiomLogger } from '@infra/axiom/logger'
import { EnvFlag } from '@infra/env/env.flag.enum'
import { EnvService } from '@infra/env/env.service'

import type { WithYear } from '@domain/types/with-year.type'
import type { ExternalTaxBracket } from './external-tax-api.types'
import { createHttpClient } from './create-http-client'
import { fetchTaxBracketsForYear } from './fetch-tax-brackets-for-year'
import { getStableTaxBrackets } from './get-stable-tax-brackets'
import { logRetryAttempt } from './log-retry-attempt'
import { throwExternalError } from './throw-external-error'

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
      if (year === 2022) {
        return getStableTaxBrackets(this.http, this.baseUrl, this.axiomLogger)
      }
      throwExternalError(error, year)
    }
  }
}
