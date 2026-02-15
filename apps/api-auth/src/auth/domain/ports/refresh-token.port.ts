export type StoredRefreshToken = {
  userId: string
  tokenHash: string
  expiresAt: Date
}

export abstract class RefreshTokenPort {
  abstract upsertForUser(data: StoredRefreshToken): Promise<void>
  abstract findByUserId(userId: string): Promise<StoredRefreshToken | null>
  abstract deleteByUserId(userId: string): Promise<void>
}
