import { TaxBracket } from './tax-bracket.value-object'
import type { TaxBracketInput } from './tax-bracket.value-object'
import { TaxYear } from './tax-year.value-object'

export type TaxRateSnapshot = {
  year: number
  brackets: TaxBracketInput[]
}

export class TaxRate {
  private constructor(
    private readonly yearValue: TaxYear,
    private readonly bracketValues: TaxBracket[]
  ) {}

  static create(year: TaxYear, brackets: TaxBracket[]): TaxRate {
    return new TaxRate(year, brackets)
  }

  static fromSnapshot(snapshot: TaxRateSnapshot): TaxRate {
    const year = TaxYear.create(snapshot.year)
    const brackets = snapshot.brackets.map((bracket) =>
      TaxBracket.create(bracket)
    )
    return new TaxRate(year, brackets)
  }

  get year(): TaxYear {
    return this.yearValue
  }

  get brackets(): TaxBracket[] {
    return this.bracketValues
  }

  toSnapshot(): TaxRateSnapshot {
    return {
      year: this.yearValue.toNumber(),
      brackets: this.bracketValues.map((bracket) => bracket.toPrimitives())
    }
  }
}
