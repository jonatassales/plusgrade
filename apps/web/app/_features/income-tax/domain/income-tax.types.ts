import { type IncomeTaxUiError } from '@/app/_features/income-tax/errors/create-income-tax-ui-error'

export type IncomeTaxFieldErrors = {
  income?: string
  year?: string
}

export type IncomeTaxFormState = {
  income: string
  year: string
  result: number | null
  formError: IncomeTaxUiError | null
  fieldErrors: IncomeTaxFieldErrors
}
