import { TAX_CONTEXT_KEY } from '@infra/plusgrade/types'
import { buildTaxRequestConfig } from '@infra/plusgrade/fetch/build-request-config'

describe('buildTaxRequestConfig', () => {
  it('returns config with tax context for the given year', () => {
    const config = buildTaxRequestConfig(2024)

    expect(config[TAX_CONTEXT_KEY]).toEqual({ year: 2024 })
  })
})
