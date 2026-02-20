import type { TaxRateSnapshot } from '@domain/types/tax-rate-snapshot.type'
import { TaxBracket as TaxBracketValueObject } from './tax-bracket.value-object'
import { TaxYear } from './tax-year.value-object'

export type { TaxRateSnapshot } from '@domain/types/tax-rate-snapshot.type'

export class TaxRate {
  private constructor(
    private readonly yearValue: TaxYear,
    private readonly bracketValues: TaxBracketValueObject[]
  ) {}

  static create(year: TaxYear, brackets: TaxBracketValueObject[]): TaxRate {
    return new TaxRate(year, brackets)
  }

  static fromSnapshot(snapshot: TaxRateSnapshot): TaxRate {
    const yearVal = TaxYear.create(snapshot.year)
    const bracketsVal = snapshot.brackets.map((bracket) =>
      TaxBracketValueObject.create(bracket)
    )
    return new TaxRate(yearVal, bracketsVal)
  }

  get year(): TaxYear {
    return this.yearValue
  }

  get brackets(): TaxBracketValueObject[] {
    return this.bracketValues
  }

  toSnapshot(): TaxRateSnapshot {
    return {
      year: this.yearValue.toNumber(),
      brackets: this.bracketValues.map((bracket) => bracket.toPrimitives())
    }
  }
}
