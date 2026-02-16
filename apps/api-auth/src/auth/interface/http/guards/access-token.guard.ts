import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { requireStringEnv } from '@common/env'
import { DbConfigFlag } from '@infra/db/config/db-config-flag.enum'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly jwtSecret = requireStringEnv(DbConfigFlag.JwtSecret)

  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string }
      user?: { sub: string; email: string }
    }>()
    const header = request.headers.authorization

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token')
    }

    const token = header.slice('Bearer '.length)

    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string
        email: string
      }>(token, { secret: this.jwtSecret })
      request.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid access token')
    }
  }
}
