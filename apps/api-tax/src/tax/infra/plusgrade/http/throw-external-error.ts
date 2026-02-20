import {
  BadGatewayException,
  ServiceUnavailableException
} from '@nestjs/common'
import axios, { type AxiosError } from 'axios'

import type { WithYear } from '@domain/types/with-year.type'

export function throwExternalError(
  error: unknown,
  year: WithYear['year']
): never {
  if (error instanceof BadGatewayException) {
    throw error
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    const statusCode = axiosError.response?.status

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      throw new BadGatewayException(`Tax API rejected request for year ${year}`)
    }

    throw new ServiceUnavailableException(
      `Tax API unavailable for year ${year}`
    )
  }

  throw new ServiceUnavailableException('Unexpected tax API failure')
}
