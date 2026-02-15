import { Injectable, UnauthorizedException } from '@nestjs/common'

import { UserPort } from '@domain/ports/user.port'
import { UserId } from '@domain/value-objects/user-id.value-object'

@Injectable()
export class MeUseCase {
  constructor(private readonly users: UserPort) {}

  async execute(userId: string) {
    const id = UserId.create(userId)
    const user = await this.users.findById(id.toString())

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    }
  }
}
