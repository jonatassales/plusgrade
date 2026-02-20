import { BadGatewayException } from '@nestjs/common'

import type { ExternalTaxBracketsResponse } from '@infra/plusgrade/types'
import { validateTaxBracketsResponse } from '@infra/plusgrade/fetch/validate-tax-brackets-response'

describe('validateTaxBracketsResponse', () => {
  it('returns tax_brackets array when valid', () => {
    const data = {
      tax_brackets: [{ min: 0, max: 50_000, rate: 0.15 }]
    }

    const result = validateTaxBracketsResponse(data, 'Invalid payload')

    expect(result).toEqual([{ min: 0, max: 50_000, rate: 0.15 }])
  })

  it('throws BadGatewayException when tax_brackets is missing', () => {
    const data = {}

    expect(() => validateTaxBracketsResponse(data, 'Missing brackets')).toThrow(
      BadGatewayException
    )
    expect(() => validateTaxBracketsResponse(data, 'Missing brackets')).toThrow(
      'Missing brackets'
    )
  })

  it('throws BadGatewayException when tax_brackets is not an array', () => {
    const data = {
      tax_brackets: 'not-array'
    } as unknown as ExternalTaxBracketsResponse

    expect(() => validateTaxBracketsResponse(data, 'Invalid')).toThrow(
      BadGatewayException
    )
  })
})
