import type { TaxBracket } from './tax-bracket.type'
import type { WithYear } from './with-year.type'

export type TaxRateSnapshot = WithYear & {
  brackets: TaxBracket[]
}
