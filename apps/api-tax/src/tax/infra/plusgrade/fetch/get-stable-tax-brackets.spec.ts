import type { AxiosInstance } from 'axios'

import { FALLBACK_TAX_YEAR } from '@infra/plusgrade/types'
import { getStableTaxBrackets } from '@infra/plusgrade/fetch/get-stable-tax-brackets'

describe('getStableTaxBrackets', () => {
  const baseUrl = 'https://tax.example.com'
  const logger = { log: jest.fn().mockResolvedValue(undefined) }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns fallback brackets and logs', async () => {
    const brackets = [{ min: 0, max: 50_000, rate: 0.15 }]
    const http = {
      get: jest.fn().mockResolvedValue({ data: { tax_brackets: brackets } })
    } as unknown as AxiosInstance

    const result = await getStableTaxBrackets(http, baseUrl, logger as never)

    expect(result).toEqual(brackets)
    expect(http.get).toHaveBeenCalledWith(
      `${baseUrl}/tax-calculator/`,
      expect.objectContaining({
        taxContext: { year: FALLBACK_TAX_YEAR }
      })
    )
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'EXTERNAL_TAX_API_FALLBACK_USED',
        context: { year: FALLBACK_TAX_YEAR }
      })
    )
  })

  it('throws when response is invalid', async () => {
    const http = {
      get: jest.fn().mockResolvedValue({ data: {} })
    } as unknown as AxiosInstance

    await expect(
      getStableTaxBrackets(http, baseUrl, logger as never)
    ).rejects.toThrow('Invalid fallback tax brackets payload')
  })
})
