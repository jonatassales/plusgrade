import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { AuthFailureReason } from '@infra/axiom/observability/auth-failure-reason.enum'
import { AuthLogEvent } from '@infra/axiom/observability/auth-log-event.enum'
import { logAxiomEvent } from '@infra/axiom/observability/axiom-logger'
import { LogLevel } from '@infra/axiom/observability/log-level.enum'
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
    } catch (error) {
      void logAxiomEvent({
        event: AuthLogEvent.AuthLogoutFailed,
        level: LogLevel.Warn,
        context: {
          reason: AuthFailureReason.InvalidRefreshToken,
          errorName: error instanceof Error ? error.name : 'unknown'
        }
      })
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
