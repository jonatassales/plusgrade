export class Password {
  private constructor(private readonly value: string) {}

  static create(value: string): Password {
    if (value.length < 8) {
      throw new Error('Password must have at least 8 characters')
    }

    return new Password(value)
  }

  toString(): string {
    return this.value
  }
}
