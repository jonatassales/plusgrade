import { TaxError } from '@/app/_features/income-tax/errors/tax-error.enum'

export type IncomeTaxUiError = {
  code: TaxError
  message: string
  retryable: boolean
}

const ERROR_MESSAGE_BY_CODE: Record<TaxError, string> = {
  [TaxError.HostResolutionFailed]: 'Could not resolve request host.',
  [TaxError.UpstreamRequestFailed]: 'Could not calculate income tax right now.',
  [TaxError.UnexpectedFailure]: 'Unexpected error while calculating income tax.'
}

export function createIncomeTaxUiError(code: TaxError): IncomeTaxUiError {
  return {
    code,
    message: ERROR_MESSAGE_BY_CODE[code],
    retryable: code !== TaxError.HostResolutionFailed
  }
}
