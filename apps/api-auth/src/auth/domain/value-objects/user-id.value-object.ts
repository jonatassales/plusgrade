export class UserId {
  private constructor(private readonly value: string) {}

  static create(value: string): UserId {
    if (!value || value.trim().length === 0) {
      throw new Error('User id is required')
    }

    return new UserId(value)
  }

  toString(): string {
    return this.value
  }
}
