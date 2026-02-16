import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException
} from '@nestjs/common'
import axios, { AxiosError, type AxiosInstance } from 'axios'

import { logAxiomEvent } from '@infra/axiom/observability/axiom-logger'
import { LogLevel } from '@infra/axiom/observability/log-level.enum'
import { TaxLogEvent } from '@infra/axiom/observability/tax-log-event.enum'

type ExternalTaxBracket = {
  min: number
  max?: number
  rate: number
}

type ExternalTaxBracketsResponse = {
  tax_brackets?: ExternalTaxBracket[]
}

@Injectable()
export class ExternalTaxApiClient {
  private readonly baseUrl = this.requireStringEnv('PLUSGRADE_TAX_API_BASE_URL')
  private readonly timeoutMs = this.requireNumberEnv('PLUSGRADE_API_TIMEOUT_MS')
  private readonly maxRetries = this.requireNumberEnv(
    'PLUSGRADE_API_MAX_RETRIES'
  )
  private readonly retryBackoffMs = this.requireNumberEnv(
    'PLUSGRADE_API_RETRY_BACKOFF_MS'
  )
  private readonly http: AxiosInstance = axios.create({
    timeout: this.timeoutMs
  })

  async getTaxBrackets(year: number): Promise<ExternalTaxBracket[]> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const { data } = await this.http.get<ExternalTaxBracketsResponse>(
          `${this.baseUrl}/tax-calculator/tax-year/${year}`
        )

        if (!Array.isArray(data.tax_brackets)) {
          throw new BadGatewayException('Invalid tax brackets payload')
        }

        return data.tax_brackets
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries
        const backoffMs = attempt * this.retryBackoffMs

        void logAxiomEvent({
          event: TaxLogEvent.ExternalTaxApiRequestFailed,
          level: isLastAttempt ? LogLevel.Error : LogLevel.Warn,
          context: {
            year,
            attempt,
            maxRetries: this.maxRetries,
            isLastAttempt,
            backoffMs,
            statusCode: axios.isAxiosError(error)
              ? error.response?.status
              : undefined,
            errorCode: axios.isAxiosError(error) ? error.code : undefined
          }
        })

        if (isLastAttempt && year !== 2022) {
          this.throwExternalError(error, year)
        }

        if (!isLastAttempt) {
          await this.sleep(backoffMs)
        }
      }
    }

    if (year === 2022) {
      return this.getStableTaxBrackets()
    }

    throw new ServiceUnavailableException('Failed to fetch tax brackets')
  }

  private throwExternalError(error: unknown, year: number): never {
    if (error instanceof BadGatewayException) {
      throw error
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      const statusCode = axiosError.response?.status

      if (statusCode && statusCode >= 400 && statusCode < 500) {
        throw new BadGatewayException(
          `Tax API rejected request for year ${year}`
        )
      }

      throw new ServiceUnavailableException(
        `Tax API unavailable for year ${year}`
      )
    }

    throw new ServiceUnavailableException('Unexpected tax API failure')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  private requireStringEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
  }

  private requireNumberEnv(name: string): number {
    const value = this.requireStringEnv(name)
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      throw new Error(`Environment variable ${name} must be a valid number`)
    }

    return parsed
  }

  private async getStableTaxBrackets(): Promise<ExternalTaxBracket[]> {
    try {
      const { data } = await this.http.get<ExternalTaxBracketsResponse>(
        `${this.baseUrl}/tax-calculator/`
      )

      if (!Array.isArray(data.tax_brackets)) {
        throw new BadGatewayException('Invalid fallback tax brackets payload')
      }

      void logAxiomEvent({
        event: TaxLogEvent.ExternalTaxApiFallbackUsed,
        level: LogLevel.Warn,
        context: {
          year: 2022
        }
      })

      return data.tax_brackets
    } catch (error) {
      this.throwExternalError(error, 2022)
    }
  }
}
