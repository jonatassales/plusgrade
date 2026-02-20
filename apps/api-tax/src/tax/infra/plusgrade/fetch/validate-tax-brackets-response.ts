import { BadGatewayException } from '@nestjs/common'

import type {
  ExternalTaxBracket,
  ExternalTaxBracketsResponse
} from '@infra/plusgrade/types'

/**
 * Validates that the API response contains an array of tax brackets.
 * Throws BadGatewayException if invalid.
 */
export function validateTaxBracketsResponse(
  data: ExternalTaxBracketsResponse,
  contextMessage: string
): ExternalTaxBracket[] {
  if (!Array.isArray(data.tax_brackets)) {
    throw new BadGatewayException(contextMessage)
  }
  return data.tax_brackets
}
