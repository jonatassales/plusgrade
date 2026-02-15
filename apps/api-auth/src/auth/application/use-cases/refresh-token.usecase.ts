import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcrypt'

import { requireStringEnv } from '@common/env'
import { RefreshTokenPort } from '@domain/ports/refresh-token.port'

@Injectable()
export class RefreshTokenUseCase {
  private readonly refreshSecret = requireStringEnv('JWT_REFRESH_SECRET')

  constructor(
    private readonly refreshTokens: RefreshTokenPort,
    private readonly jwt: JwtService
  ) {}

  async execute(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.refreshSecret
      })
      const stored = await this.refreshTokens.findByUserId(payload.sub)

      if (!stored) {
        // TODO: Send invalid refresh token attempts to external observability tool.
        throw new UnauthorizedException('Refresh token is invalid')
      }

      if (stored.expiresAt.getTime() <= Date.now()) {
        await this.refreshTokens.deleteByUserId(payload.sub)
        throw new UnauthorizedException('Refresh token expired')
      }

      const validHash = await compare(refreshToken, stored.tokenHash)
      if (!validHash) {
        // TODO: Send invalid refresh token attempts to external observability tool.
        throw new UnauthorizedException('Refresh token is invalid')
      }

      const newAccess = await this.jwt.signAsync({
        sub: payload.sub,
        email: payload.email
      })

      return { accessToken: newAccess }
    } catch {
      throw new UnauthorizedException()
    }
  }
}
