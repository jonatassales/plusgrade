import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { requireStringEnv } from '@common/env'

import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    MongooseModule.forRoot(requireStringEnv('MONGO_URI'), {
      dbName: 'api-auth'
    }),

    AuthModule
  ]
})
export class AppModule {}
