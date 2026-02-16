import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'

import {
  hashSensitiveValue,
  logAxiomEvent
} from '@infra/axiom/observability/axiom-logger'
import { AuthFailureReason } from '@infra/axiom/observability/auth-failure-reason.enum'
import { AuthLogEvent } from '@infra/axiom/observability/auth-log-event.enum'
import { LogLevel } from '@infra/axiom/observability/log-level.enum'
import { requireStringEnv } from '@common/env'
import { RefreshTokenPort } from '@domain/ports/refresh-token.port'
import { UserPort } from '@domain/ports/user.port'
import { Email } from '@domain/value-objects/email.value-object'
import { Password } from '@domain/value-objects/password.value-object'

@Injectable()
export class LoginUseCase {
  private readonly refreshSecret = requireStringEnv('JWT_REFRESH_SECRET')
  private readonly refreshExpiresIn = requireStringEnv(
    'JWT_REFRESH_EXPIRES_IN'
  ) as never

  constructor(
    private readonly users: UserPort,
    private readonly refreshTokens: RefreshTokenPort,
    private readonly jwt: JwtService
  ) {}

  async execute(email: string, password: string) {
    const emailVo = Email.create(email)
    const passwordVo = Password.create(password)
    const user = await this.users.findByEmail(emailVo)

    if (!user) {
      void logAxiomEvent({
        event: AuthLogEvent.AuthLoginFailed,
        level: LogLevel.Warn,
        context: {
          reason: AuthFailureReason.UserNotFound,
          emailHash: hashSensitiveValue(emailVo.toString())
        }
      })
      throw new UnauthorizedException('Invalid credentials')
    }

    const ok = await compare(passwordVo.toString(), user.passwordHash)

    if (!ok) {
      void logAxiomEvent({
        event: AuthLogEvent.AuthLoginFailed,
        level: LogLevel.Warn,
        context: {
          reason: AuthFailureReason.PasswordMismatch,
          userId: user.id,
          emailHash: hashSensitiveValue(user.email)
        }
      })
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload = { sub: user.id, email: user.email }

    const accessToken = await this.jwt.signAsync(payload)
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn
    })
    const refreshTokenHash = await hash(refreshToken, 10)
    const decoded = this.jwt.decode(refreshToken) as { exp?: number } | null

    if (!decoded?.exp) {
      throw new UnauthorizedException('Invalid refresh token payload')
    }

    await this.refreshTokens.upsertForUser({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(decoded.exp * 1000)
    })

    return { accessToken, refreshToken }
  }
}
