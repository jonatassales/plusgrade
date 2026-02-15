import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from '@domain/entities/user.entity'
import { UserPort } from '@domain/ports/user.port'
import { Email } from '@domain/value-objects/email.value-object'
import { userMapper } from '@infra/mappers/user.mapper'
import {
  type UserDocument,
  User as UserSchema
} from '@infra/mongoose/schemas/user.schema'

@Injectable()
export class MongooseUserAdapter extends UserPort {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly model: Model<UserDocument>
  ) {
    super()
  }

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await this.model.findOne({ email: email.toString() })

    if (!doc) return null

    return userMapper.toDomain(doc)
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.model.findById(id)

    if (!doc) return null

    return userMapper.toDomain(doc)
  }

  async create(user: User): Promise<void> {
    const data = userMapper.toPersistence(user)
    await this.model.create(data)
  }
}
