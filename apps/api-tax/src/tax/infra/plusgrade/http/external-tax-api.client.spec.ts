const mockGet = jest.fn()
const mockCreate = jest.fn(() => ({ get: mockGet }))

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: mockCreate,
    isAxiosError: (error: unknown) =>
      Boolean(error && typeof error === 'object' && 'isAxiosError' in error)
  },
  create: mockCreate,
  isAxiosError: (error: unknown) =>
    Boolean(error && typeof error === 'object' && 'isAxiosError' in error)
}))

import {
  BadGatewayException,
  ServiceUnavailableException
} from '@nestjs/common'

import { ExternalTaxApiClient } from './external-tax-api.client'

describe('ExternalTaxApiClient', () => {
  const brackets = [{ min: 0, max: 50197, rate: 0.15 }]

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.PLUSGRADE_TAX_API_BASE_URL = 'http://mock-tax-api:5001'
    process.env.PLUSGRADE_API_TIMEOUT_MS = '3000'
    process.env.PLUSGRADE_API_MAX_RETRIES = '3'
    process.env.PLUSGRADE_API_RETRY_BACKOFF_MS = '150'
  })

  it('retries and succeeds before max retries', async () => {
    mockGet
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 500 } })
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 503 } })
      .mockResolvedValueOnce({ data: { tax_brackets: brackets } })

    const client = new ExternalTaxApiClient()
    const result = await client.getTaxBrackets(2022)

    expect(result).toEqual(brackets)
    expect(mockGet).toHaveBeenCalledTimes(3)
  })

  it('falls back to stable endpoint for 2022', async () => {
    mockGet.mockImplementation(async (url: string) => {
      if (url.endsWith('/tax-calculator/')) {
        return { data: { tax_brackets: brackets } }
      }

      throw { isAxiosError: true, response: { status: 500 } }
    })

    const client = new ExternalTaxApiClient()
    const result = await client.getTaxBrackets(2022)

    expect(result).toEqual(brackets)
    expect(mockGet).toHaveBeenCalledTimes(4)
  })

  it('throws service unavailable for non-2022 failures', async () => {
    mockGet.mockRejectedValue({
      isAxiosError: true,
      response: { status: 503 }
    })

    const client = new ExternalTaxApiClient()

    await expect(client.getTaxBrackets(2021)).rejects.toBeInstanceOf(
      ServiceUnavailableException
    )
  })

  it('throws bad gateway for 4xx errors', async () => {
    mockGet.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 }
    })

    const client = new ExternalTaxApiClient()

    await expect(client.getTaxBrackets(2021)).rejects.toBeInstanceOf(
      BadGatewayException
    )
  })
})
