import { INestApplication } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcrypt'
import request from 'supertest'

import { LoginUseCase } from '@application/use-cases/login.usecase'
import { LogoutUseCase } from '@application/use-cases/logout.usecase'
import { MeUseCase } from '@application/use-cases/me.usecase'
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.usecase'
import { SignupUseCase } from '@application/use-cases/signup.usecase'
import {
  RefreshTokenPort,
  type StoredRefreshToken
} from '@domain/ports/refresh-token.port'
import { User } from '@domain/entities/user.entity'
import { UserPort } from '@domain/ports/user.port'
import { Email } from '@domain/value-objects/email.value-object'
import { AccessTokenGuard } from '@interface/http/guards/access-token.guard'

import { AuthController } from './auth.controller'

class InMemoryUserPort extends UserPort {
  users = new Map<string, User>()

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email.toString()) return user
    }

    return null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async create(user: User): Promise<void> {
    this.users.set(user.id, user)
  }
}

class InMemoryRefreshTokenPort extends RefreshTokenPort {
  tokens = new Map<string, StoredRefreshToken>()

  async upsertForUser(data: StoredRefreshToken): Promise<void> {
    this.tokens.set(data.userId, data)
  }

  async findByUserId(userId: string): Promise<StoredRefreshToken | null> {
    return this.tokens.get(userId) ?? null
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.tokens.delete(userId)
  }
}

describe('AuthController (integration)', () => {
  let app: INestApplication
  let jwt: JwtService

  beforeAll(async () => {
    process.env.JWT_SECRET = 'access-secret'
    process.env.JWT_EXPIRES_IN = '15m'
    process.env.JWT_REFRESH_SECRET = 'refresh-secret'
    process.env.JWT_REFRESH_EXPIRES_IN = '7d'

    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN as never
          }
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
        { provide: UserPort, useClass: InMemoryUserPort },
        { provide: RefreshTokenPort, useClass: InMemoryRefreshTokenPort }
      ]
    }).compile()

    app = moduleRef.createNestApplication()
    jwt = moduleRef.get(JwtService)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('supports signup/login/me/refresh/logout flow', async () => {
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'john@example.com', password: '12345678' })

    expect(signupResponse.status).toBe(201)
    expect(signupResponse.body.userId).toBeDefined()

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@example.com', password: '12345678' })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body.accessToken).toBeDefined()
    expect(loginResponse.body.refreshToken).toBeDefined()

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(meResponse.status).toBe(200)
    expect(meResponse.body.email).toBe('john@example.com')

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken })

    expect(refreshResponse.status).toBe(200)
    expect(refreshResponse.body.accessToken).toBeDefined()

    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken: loginResponse.body.refreshToken })

    expect(logoutResponse.status).toBe(200)
    expect(logoutResponse.body.success).toBe(true)

    const refreshAfterLogoutResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken })

    expect(refreshAfterLogoutResponse.status).toBe(401)
  })

  it('returns unauthorized for invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@example.com', password: 'wrong-pass' })

    expect(response.status).toBe(401)
  })

  it('rejects unexpected body properties', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'strict@example.com',
        password: '12345678',
        extra: 'value'
      })

    expect(response.status).toBe(400)
  })

  it('protects me route', async () => {
    const userId = 'u-protected'
    const user = new User({
      id: userId,
      email: 'protected@example.com',
      passwordHash: await hash('12345678', 10),
      createdAt: new Date()
    })
    const users = app.get(UserPort) as InMemoryUserPort
    await users.create(user)
    const accessToken = await jwt.signAsync({ sub: userId, email: user.email })

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(userId)
  })
})
