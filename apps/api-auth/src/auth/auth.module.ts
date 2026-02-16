import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { LoginUseCase } from '@application/use-cases/login.usecase'
import { LogoutUseCase } from '@application/use-cases/logout.usecase'
import { MeUseCase } from '@application/use-cases/me.usecase'
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.usecase'
import { SignupUseCase } from '@application/use-cases/signup.usecase'
import { requireStringEnv } from '@common/env'
import { RefreshTokenPort } from '@domain/ports/refresh-token.port'
import { UserPort } from '@domain/ports/user.port'
import { DbConfigFlag } from '@infra/db/config/db-config-flag.enum'
import { MongooseRefreshTokenAdapter } from '@infra/mongoose/adapters/mongoose-refresh-token.adapter'
import { MongooseUserAdapter } from '@infra/mongoose/adapters/mongoose-user.adapter'
import { RefreshTokenSchemaDefinition } from '@infra/mongoose/schemas/refresh-token.schema'
import { UserSchemaDefinition } from '@infra/mongoose/schemas/user.schema'
import { AuthController } from '@interface/http/auth.controller'
import { AccessTokenGuard } from '@interface/http/guards/access-token.guard'

@Module({
  imports: [
    ConfigModule,

    MongooseModule.forFeature([
      { name: 'User', schema: UserSchemaDefinition },
      { name: 'RefreshToken', schema: RefreshTokenSchemaDefinition }
    ]),

    JwtModule.registerAsync({
      useFactory: () => ({
        secret: requireStringEnv(DbConfigFlag.JwtSecret),
        signOptions: {
          expiresIn: requireStringEnv(DbConfigFlag.JwtExpiresIn) as never
        }
      })
    })
  ],

  controllers: [AuthController],

  providers: [
    SignupUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    MeUseCase,
    AccessTokenGuard,

    {
      provide: UserPort,
      useClass: MongooseUserAdapter
    },
    {
      provide: RefreshTokenPort,
      useClass: MongooseRefreshTokenAdapter
    }
  ],

  exports: [JwtModule]
})
export class AuthModule {}
