import type { AxiosInstance } from 'axios'

import { fetchTaxBracketsForYear } from '@infra/plusgrade/fetch/fetch-tax-brackets-for-year'

describe('fetchTaxBracketsForYear', () => {
  const baseUrl = 'https://tax.example.com'

  it('returns tax brackets from API response', async () => {
    const brackets = [{ min: 0, max: 50_000, rate: 0.15 }]
    const http = {
      get: jest.fn().mockResolvedValue({ data: { tax_brackets: brackets } })
    } as unknown as AxiosInstance

    const result = await fetchTaxBracketsForYear(http, baseUrl, 2024)

    expect(result).toEqual(brackets)
    expect(http.get).toHaveBeenCalledWith(
      `${baseUrl}/tax-calculator/tax-year/2024`,
      expect.any(Object)
    )
  })

  it('throws when response has invalid payload', async () => {
    const http = {
      get: jest.fn().mockResolvedValue({ data: {} })
    } as unknown as AxiosInstance

    await expect(fetchTaxBracketsForYear(http, baseUrl, 2023)).rejects.toThrow(
      'Invalid tax brackets payload'
    )
  })
})
