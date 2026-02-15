export type UserProps = {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
  refreshTokenHash?: string | null
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id() {
    return this.props.id
  }

  get email() {
    return this.props.email
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  get createdAt() {
    return this.props.createdAt
  }

  get refreshTokenHash() {
    return this.props.refreshTokenHash ?? null
  }

  setRefreshTokenHash(hash: string | null) {
    this.props.refreshTokenHash = hash
  }

  toJSON(): UserProps {
    return { ...this.props }
  }
}
