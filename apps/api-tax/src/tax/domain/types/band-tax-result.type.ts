import type { TaxBracket } from './tax-bracket.type'

export type BandTaxResult = TaxBracket & {
  taxableIncome: number
  tax: number
}
