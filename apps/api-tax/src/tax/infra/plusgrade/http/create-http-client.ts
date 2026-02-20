import axios, { type AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'

import type { TaxRequestConfig } from './external-tax-api.types'
import { TAX_CONTEXT_KEY } from './external-tax-api.types'
import type { LogRetryAttemptParams } from './log-retry-attempt'

export type CreateHttpClientParams = {
  baseUrl: string
  timeoutMs: number
  maxRetries: number
  retryBackoffMs: number
  onRetry: (params: LogRetryAttemptParams) => void
}

export function createHttpClient(
  params: CreateHttpClientParams
): AxiosInstance {
  const { timeoutMs, maxRetries, retryBackoffMs, onRetry } = params

  const instance = axios.create({ timeout: timeoutMs })

  axiosRetry(instance, {
    retries: maxRetries - 1,
    retryDelay: (retryCount) => retryCount * retryBackoffMs,
    onRetry: (retryCount, error, requestConfig) => {
      const year =
        (requestConfig as TaxRequestConfig)[TAX_CONTEXT_KEY]?.year ?? 0
      onRetry({
        attempt: retryCount + 1,
        error,
        year,
        isLastAttempt: retryCount >= maxRetries - 1,
        maxRetries,
        retryBackoffMs
      })
    }
  })

  return instance
}
