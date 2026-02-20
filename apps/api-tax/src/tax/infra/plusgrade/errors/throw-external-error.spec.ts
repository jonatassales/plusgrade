import {
  BadGatewayException,
  ServiceUnavailableException
} from '@nestjs/common'
import axios from 'axios'

import { throwExternalError } from '@infra/plusgrade/errors/throw-external-error'

describe('throwExternalError', () => {
  it('re-throws BadGatewayException as-is', () => {
    const error = new BadGatewayException('Invalid payload')

    expect(() => throwExternalError(error, 2024)).toThrow(BadGatewayException)
    expect(() => throwExternalError(error, 2024)).toThrow('Invalid payload')
  })

  it('throws BadGatewayException for 4xx Axios errors', () => {
    const error = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 400 }
    })

    expect(() => throwExternalError(error, 2023)).toThrow(BadGatewayException)
    expect(() => throwExternalError(error, 2023)).toThrow(
      'Tax API rejected request for year 2023'
    )
  })

  it('throws ServiceUnavailableException for 5xx Axios errors', () => {
    const error = Object.assign(new Error('Server error'), {
      isAxiosError: true,
      response: { status: 503 }
    })

    expect(() => throwExternalError(error, 2022)).toThrow(
      ServiceUnavailableException
    )
    expect(() => throwExternalError(error, 2022)).toThrow(
      'Tax API unavailable for year 2022'
    )
  })

  it('throws ServiceUnavailableException for unknown errors', () => {
    const error = new Error('Network failure')

    expect(() => throwExternalError(error, 2025)).toThrow(
      ServiceUnavailableException
    )
    expect(() => throwExternalError(error, 2025)).toThrow(
      'Unexpected tax API failure'
    )
  })
})
