import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import {
  RefreshTokenPort,
  type StoredRefreshToken
} from '@domain/ports/refresh-token.port'

import { LogoutUseCase } from './logout.usecase'

class InMemoryRefreshTokenPort extends RefreshTokenPort {
  deletedUserId: string | null = null

  async upsertForUser(_data: StoredRefreshToken): Promise<void> {}

  async findByUserId(_userId: string): Promise<StoredRefreshToken | null> {
    return null
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.deletedUserId = userId
  }
}

describe('LogoutUseCase', () => {
  beforeEach(() => {
    process.env.JWT_REFRESH_SECRET = 'refresh-secret'
  })

  it('invalidates refresh token for user', async () => {
    const refreshTokens = new InMemoryRefreshTokenPort()
    const jwt = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'u-1' })
    } as unknown as JwtService
    const useCase = new LogoutUseCase(refreshTokens, jwt)

    const result = await useCase.execute('refresh-token')

    expect(result).toEqual({ success: true })
    expect(refreshTokens.deletedUserId).toBe('u-1')
  })

  it('throws unauthorized for invalid refresh token', async () => {
    const refreshTokens = new InMemoryRefreshTokenPort()
    const jwt = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('invalid'))
    } as unknown as JwtService
    const useCase = new LogoutUseCase(refreshTokens, jwt)

    await expect(useCase.execute('bad-token')).rejects.toBeInstanceOf(
      UnauthorizedException
    )
  })
})
