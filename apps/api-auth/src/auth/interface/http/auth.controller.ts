import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'

import { LoginUseCase } from '@application/use-cases/login.usecase'
import { LogoutUseCase } from '@application/use-cases/logout.usecase'
import { MeUseCase } from '@application/use-cases/me.usecase'
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.usecase'
import { SignupUseCase } from '@application/use-cases/signup.usecase'
import { type AuthResponseDto } from '@interface/dto/auth-response.dto'
import { type LoginRequestDto } from '@interface/dto/login-request.dto'
import { type MeResponseDto } from '@interface/dto/me-response.dto'
import { type RefreshTokenRequestDto } from '@interface/dto/refresh-token-request.dto'
import { type SignupRequestDto } from '@interface/dto/signup-request.dto'
import { AccessTokenGuard } from '@interface/http/guards/access-token.guard'
import { LoginBodyPipe } from '@interface/pipes/login-body.pipe'
import { RefreshTokenBodyPipe } from '@interface/pipes/refresh-token-body.pipe'
import { SignupBodyPipe } from '@interface/pipes/signup-body.pipe'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signup: SignupUseCase,
    private readonly login: LoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logout: LogoutUseCase,
    private readonly me: MeUseCase
  ) {}

  @Post('signup')
  async signupHandler(@Body(SignupBodyPipe) body: SignupRequestDto) {
    return this.signup.execute(body)
  }

  @Post('login')
  @HttpCode(200)
  async loginHandler(
    @Body(LoginBodyPipe) body: LoginRequestDto
  ): Promise<AuthResponseDto> {
    return this.login.execute(body.email, body.password)
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshTokenHandler(
    @Body(RefreshTokenBodyPipe) body: RefreshTokenRequestDto
  ): Promise<{ accessToken: string }> {
    return this.refreshToken.execute(body.refreshToken)
  }

  @Post('logout')
  @HttpCode(200)
  async logoutHandler(
    @Body(RefreshTokenBodyPipe) body: RefreshTokenRequestDto
  ): Promise<{ success: boolean }> {
    return this.logout.execute(body.refreshToken)
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async meHandler(
    @Req() request: { user: { sub: string } }
  ): Promise<MeResponseDto> {
    return this.me.execute(request.user.sub)
  }
}
