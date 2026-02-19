import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcrypt'

import {
  RefreshTokenPort,
  type StoredRefreshToken
} from '@domain/ports/refresh-token.port'

import { RefreshTokenUseCase } from './refresh-token.usecase'

class InMemoryRefreshTokenPort implements RefreshTokenPort {
  constructor(private readonly stored: StoredRefreshToken | null) {}

  async upsertForUser(_data: StoredRefreshToken): Promise<void> {}

  async findByUserId(_userId: string): Promise<StoredRefreshToken | null> {
    return this.stored
  }

  async deleteByUserId(_userId: string): Promise<void> {}
}

describe('RefreshTokenUseCase', () => {
  beforeEach(() => {
    process.env.JWT_REFRESH_SECRET = 'refresh-secret'
  })

  it('returns a new access token when refresh token is valid', async () => {
    const tokenHash = await hash('refresh-token', 10)
    const refreshTokens = new InMemoryRefreshTokenPort({
      userId: 'u-1',
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000)
    })
    const jwt = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: 'u-1', email: 'john@example.com' }),
      signAsync: jest.fn().mockResolvedValue('new-access-token')
    } as unknown as JwtService
    const useCase = new RefreshTokenUseCase(refreshTokens, jwt)

    const result = await useCase.execute('refresh-token')

    expect(result).toEqual({ accessToken: 'new-access-token' })
  })

  it('throws unauthorized when refresh token is invalid', async () => {
    const refreshTokens = new InMemoryRefreshTokenPort(null)
    const jwt = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: 'u-1', email: 'john@example.com' }),
      signAsync: jest.fn()
    } as unknown as JwtService
    const useCase = new RefreshTokenUseCase(refreshTokens, jwt)

    await expect(useCase.execute('bad-token')).rejects.toBeInstanceOf(
      UnauthorizedException
    )
  })
})
