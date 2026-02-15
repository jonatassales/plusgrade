export type CalculateTaxResponseDto = {
  year: number
  salary: number
  totalTax: number
  effectiveRate: number
  taxesByBand: Array<{
    min: number
    max: number | null
    rate: number
    taxableIncome: number
    tax: number
  }>
}
