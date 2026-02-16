import { ConflictException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { AuthFailureReason } from '@infra/axiom/observability/auth-failure-reason.enum'
import { AuthLogEvent } from '@infra/axiom/observability/auth-log-event.enum'
import {
  hashSensitiveValue,
  logAxiomEvent
} from '@infra/axiom/observability/axiom-logger'
import { LogLevel } from '@infra/axiom/observability/log-level.enum'
import { User } from '@domain/entities/user.entity'
import { UserPort } from '@domain/ports/user.port'
import { Email } from '@domain/value-objects/email.value-object'
import { Password } from '@domain/value-objects/password.value-object'

type SignupInput = {
  email: string
  password: string
}

@Injectable()
export class SignupUseCase {
  constructor(private readonly users: UserPort) {}

  async execute(input: SignupInput) {
    const email = Email.create(input.email)
    const password = Password.create(input.password)
    const existing = await this.users.findByEmail(email)

    if (existing) {
      void logAxiomEvent({
        event: AuthLogEvent.AuthSignupFailed,
        level: LogLevel.Warn,
        context: {
          reason: AuthFailureReason.EmailAlreadyRegistered,
          emailHash: hashSensitiveValue(email.toString())
        }
      })
      throw new ConflictException('Email already registered')
    }

    const hash = await bcrypt.hash(password.toString(), 10)

    const user = new User({
      id: crypto.randomUUID(),
      email: email.toString(),
      passwordHash: hash,
      createdAt: new Date()
    })

    await this.users.create(user)

    return {
      userId: user.id
    }
  }
}
