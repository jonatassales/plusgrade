import type { TaxRate } from '@domain/value-objects/tax-rate.value-object'
import type { TaxYear } from '@domain/value-objects/tax-year.value-object'

export abstract class TaxRatePort {
  abstract findByYear(year: TaxYear): Promise<TaxRate | null>
}
