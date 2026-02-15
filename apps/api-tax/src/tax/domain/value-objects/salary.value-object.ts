export class Salary {
  private constructor(private readonly value: number) {}

  static create(value: number): Salary {
    if (!Number.isFinite(value)) {
      throw new Error('Salary must be a valid number')
    }

    if (value < 0) {
      throw new Error('Salary must be greater than or equal to 0')
    }

    return new Salary(value)
  }

  toNumber(): number {
    return this.value
  }
}
