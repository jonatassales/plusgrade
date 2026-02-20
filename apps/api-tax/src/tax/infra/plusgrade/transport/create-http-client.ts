import axios, { type AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'

import type { TaxRequestConfig } from '@infra/plusgrade/types'
import { TAX_CONTEXT_KEY } from '@infra/plusgrade/types'
import type { LogRetryAttemptParams } from '@infra/plusgrade/logging/log-retry-attempt'

export type CreateHttpClientParams = {
  baseUrl: string
  timeoutMs: number
  maxRetries: number
  retryBackoffMs: number
  onRetry: (params: LogRetryAttemptParams) => void
}

function buildOnRetry(
  maxRetries: number,
  retryBackoffMs: number,
  onRetry: (params: LogRetryAttemptParams) => void
) {
  return (
    retryCount: number,
    error: unknown,
    requestConfig: TaxRequestConfig
  ) => {
    const year = requestConfig[TAX_CONTEXT_KEY]?.year ?? 0
    onRetry({
      attempt: retryCount + 1,
      error,
      year,
      isLastAttempt: retryCount >= maxRetries - 1,
      maxRetries,
      retryBackoffMs
    })
  }
}

/**
 * Creates an Axios instance with retry and timeout, used for the external tax API.
 */
export function createHttpClient(
  params: CreateHttpClientParams
): AxiosInstance {
  const { timeoutMs, maxRetries, retryBackoffMs, onRetry } = params

  const instance = axios.create({ timeout: timeoutMs })

  axiosRetry(instance, {
    retries: maxRetries - 1,
    retryDelay: (retryCount) => retryCount * retryBackoffMs,
    onRetry: buildOnRetry(maxRetries, retryBackoffMs, onRetry)
  })

  return instance
}
