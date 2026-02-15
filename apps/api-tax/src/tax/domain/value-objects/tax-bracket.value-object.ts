export interface TaxBracketInput {
  min: number
  max: number | null
  rate: number
}

export class TaxBracket {
  private constructor(
    private readonly minValue: number,
    private readonly maxValue: number | null,
    private readonly rateValue: number
  ) {}

  static create(input: TaxBracketInput): TaxBracket {
    if (!Number.isFinite(input.min) || input.min < 0) {
      throw new Error('Tax bracket min must be a positive number')
    }

    if (
      input.max !== null &&
      (!Number.isFinite(input.max) || input.max <= input.min)
    ) {
      throw new Error('Tax bracket max must be greater than min')
    }

    if (!Number.isFinite(input.rate) || input.rate < 0 || input.rate > 1) {
      throw new Error('Tax bracket rate must be between 0 and 1')
    }

    return new TaxBracket(input.min, input.max, input.rate)
  }

  get min(): number {
    return this.minValue
  }

  get max(): number | null {
    return this.maxValue
  }

  get rate(): number {
    return this.rateValue
  }

  toPrimitives(): TaxBracketInput {
    return {
      min: this.minValue,
      max: this.maxValue,
      rate: this.rateValue
    }
  }
}
