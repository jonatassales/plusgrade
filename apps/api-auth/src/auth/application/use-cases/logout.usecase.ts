import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { requireStringEnv } from '@common/env'
import { RefreshTokenPort } from '@domain/ports/refresh-token.port'

@Injectable()
export class LogoutUseCase {
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

      await this.refreshTokens.deleteByUserId(payload.sub)

      return { success: true }
    } catch {
      // TODO: Send failed logout attempts to external observability tool.
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
