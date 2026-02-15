export class TaxYear {
  private static readonly supportedYears = new Set([2019, 2020, 2021, 2022])

  private constructor(private readonly value: number) {}

  static create(value: number): TaxYear {
    if (!Number.isInteger(value)) {
      throw new Error('Year must be integer')
    }

    if (!TaxYear.supportedYears.has(value)) {
      throw new Error('Year not supported')
    }

    return new TaxYear(value)
  }

  toNumber(): number {
    return this.value
  }

  toString(): string {
    return String(this.value)
  }
}
