export type IncomeTaxFieldErrors = {
  income?: string
  year?: string
}

export type IncomeTaxFormState = {
  income: string
  year: string
  result: number | null
  formError: string | null
  fieldErrors: IncomeTaxFieldErrors
}
