import { ExternalTaxApiClient } from '@infra/plusgrade/client/api-client'
import * as fetchTaxBracketsModule from '@infra/plusgrade/fetch/fetch-tax-brackets-for-year'
import * as getStableTaxBracketsModule from '@infra/plusgrade/fetch/get-stable-tax-brackets'
import { FALLBACK_TAX_YEAR } from '@infra/plusgrade/types'

jest.mock('@infra/plusgrade/fetch/fetch-tax-brackets-for-year')
jest.mock('@infra/plusgrade/fetch/get-stable-tax-brackets')
jest.mock('@infra/plusgrade/transport/create-http-client', () => ({
  createHttpClient: () => ({})
}))

const fetchTaxBracketsForYear =
  fetchTaxBracketsModule.fetchTaxBracketsForYear as jest.MockedFunction<
    typeof fetchTaxBracketsModule.fetchTaxBracketsForYear
  >
const getStableTaxBrackets =
  getStableTaxBracketsModule.getStableTaxBrackets as jest.MockedFunction<
    typeof getStableTaxBracketsModule.getStableTaxBrackets
  >

describe('ExternalTaxApiClient', () => {
  const baseUrl = 'https://tax.example.com'
  const axiomLogger = { log: jest.fn().mockResolvedValue(undefined) }
  const env = {
    requireString: jest.fn((key: string) =>
      key === 'PlusgradeTaxApiBaseUrl' ? baseUrl : ''
    ),
    requireNumber: jest.fn((key: string) => {
      if (key === 'PlusgradeApiTimeoutMs') return 5000
      if (key === 'PlusgradeApiMaxRetries') return 3
      if (key === 'PlusgradeApiRetryBackoffMs') return 1000
      return 0
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getTaxBrackets returns brackets from fetch for given year', async () => {
    const brackets = [{ min: 0, max: 50_000, rate: 0.15 }]
    fetchTaxBracketsForYear.mockResolvedValue(brackets)

    const client = new ExternalTaxApiClient(env as never, axiomLogger as never)

    const result = await client.getTaxBrackets(2024)

    expect(result).toEqual(brackets)
    expect(fetchTaxBracketsForYear).toHaveBeenCalledTimes(1)
  })

  it('getTaxBrackets uses stable fallback when fetch fails for fallback year', async () => {
    const fallbackBrackets = [{ min: 0, max: 50_000, rate: 0.15 }]
    fetchTaxBracketsForYear.mockRejectedValue(new Error('Network error'))
    getStableTaxBrackets.mockResolvedValue(fallbackBrackets)

    const client = new ExternalTaxApiClient(env as never, axiomLogger as never)

    const result = await client.getTaxBrackets(FALLBACK_TAX_YEAR)

    expect(result).toEqual(fallbackBrackets)
    expect(getStableTaxBrackets).toHaveBeenCalledTimes(1)
  })

  it('getTaxBrackets throws when fetch fails for non-fallback year', async () => {
    fetchTaxBracketsForYear.mockRejectedValue(new Error('Network error'))

    const client = new ExternalTaxApiClient(env as never, axiomLogger as never)

    await expect(client.getTaxBrackets(2025)).rejects.toThrow()
    expect(getStableTaxBrackets).not.toHaveBeenCalled()
  })
})
