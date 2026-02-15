export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalized)) {
      throw new Error('Email must be valid')
    }

    return new Email(normalized)
  }

  toString(): string {
    return this.value
  }
}
