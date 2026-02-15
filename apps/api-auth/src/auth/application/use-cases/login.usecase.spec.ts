import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcrypt'

import { User } from '@domain/entities/user.entity'
import {
  RefreshTokenPort,
  type StoredRefreshToken
} from '@domain/ports/refresh-token.port'
import { UserPort } from '@domain/ports/user.port'
import { Email } from '@domain/value-objects/email.value-object'

import { LoginUseCase } from './login.usecase'

class InMemoryUserPort extends UserPort {
  constructor(private readonly user: User | null) {
    super()
  }

  async findByEmail(_email: Email): Promise<User | null> {
    return this.user
  }

  async findById(_id: string): Promise<User | null> {
    return this.user
  }

  async create(_user: User): Promise<void> {}
}

class InMemoryRefreshTokenPort extends RefreshTokenPort {
  stored: StoredRefreshToken | null = null

  async upsertForUser(data: StoredRefreshToken): Promise<void> {
    this.stored = data
  }

  async findByUserId(_userId: string): Promise<StoredRefreshToken | null> {
    return this.stored
  }

  async deleteByUserId(_userId: string): Promise<void> {
    this.stored = null
  }
}

describe('LoginUseCase', () => {
  beforeEach(() => {
    process.env.JWT_REFRESH_SECRET = 'refresh-secret'
    process.env.JWT_REFRESH_EXPIRES_IN = '7d'
  })

  it('returns access and refresh tokens', async () => {
    const passwordHash = await hash('12345678', 10)
    const user = new User({
      id: 'u-1',
      email: 'john@example.com',
      passwordHash,
      createdAt: new Date()
    })
    const users = new InMemoryUserPort(user)
    const refreshTokens = new InMemoryRefreshTokenPort()
    const jwt = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access')
        .mockResolvedValueOnce('refresh'),
      decode: jest
        .fn()
        .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
    } as unknown as JwtService
    const useCase = new LoginUseCase(users, refreshTokens, jwt)

    const result = await useCase.execute('john@example.com', '12345678')

    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' })
    expect(refreshTokens.stored?.userId).toBe('u-1')
    expect(refreshTokens.stored?.tokenHash).toBeDefined()
  })

  it('throws unauthorized when credentials are invalid', async () => {
    const users = new InMemoryUserPort(null)
    const refreshTokens = new InMemoryRefreshTokenPort()
    const jwt = {
      signAsync: jest.fn(),
      decode: jest.fn()
    } as unknown as JwtService
    const useCase = new LoginUseCase(users, refreshTokens, jwt)

    await expect(
      useCase.execute('john@example.com', '12345678')
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
