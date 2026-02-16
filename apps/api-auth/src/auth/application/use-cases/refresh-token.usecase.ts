import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcrypt'

import { AuthFailureReason } from '@infra/axiom/observability/auth-failure-reason.enum'
import { AuthLogEvent } from '@infra/axiom/observability/auth-log-event.enum'
import { logAxiomEvent } from '@infra/axiom/observability/axiom-logger'
import { LogLevel } from '@infra/axiom/observability/log-level.enum'
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
        void logAxiomEvent({
          event: AuthLogEvent.AuthRefreshFailed,
          level: LogLevel.Warn,
          context: {
            reason: AuthFailureReason.TokenNotFound,
            userId: payload.sub
          }
        })
        throw new UnauthorizedException('Refresh token is invalid')
      }

      if (stored.expiresAt.getTime() <= Date.now()) {
        await this.refreshTokens.deleteByUserId(payload.sub)
        throw new UnauthorizedException('Refresh token expired')
      }

      const validHash = await compare(refreshToken, stored.tokenHash)
      if (!validHash) {
        void logAxiomEvent({
          event: AuthLogEvent.AuthRefreshFailed,
          level: LogLevel.Warn,
          context: {
            reason: AuthFailureReason.TokenHashMismatch,
            userId: payload.sub
          }
        })
        throw new UnauthorizedException('Refresh token is invalid')
      }

      const newAccess = await this.jwt.signAsync({
        sub: payload.sub,
        email: payload.email
      })

      return { accessToken: newAccess }
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        void logAxiomEvent({
          event: AuthLogEvent.AuthRefreshFailed,
          level: LogLevel.Warn,
          context: {
            reason: AuthFailureReason.TokenVerificationFailed,
            errorName: error instanceof Error ? error.name : 'unknown'
          }
        })
      }
      throw new UnauthorizedException()
    }
  }
}
