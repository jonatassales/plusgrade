import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import {
  RefreshTokenPort,
  type StoredRefreshToken
} from '@domain/ports/refresh-token.port'
import {
  type RefreshTokenDocument,
  RefreshToken as RefreshTokenSchema
} from '@infra/mongoose/schemas/refresh-token.schema'

@Injectable()
export class MongooseRefreshTokenAdapter extends RefreshTokenPort {
  constructor(
    @InjectModel(RefreshTokenSchema.name)
    private readonly model: Model<RefreshTokenDocument>
  ) {
    super()
  }

  async upsertForUser(data: StoredRefreshToken): Promise<void> {
    await this.model.updateOne(
      { userId: data.userId },
      {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt
      },
      { upsert: true }
    )
  }

  async findByUserId(userId: string): Promise<StoredRefreshToken | null> {
    const doc = await this.model.findOne({ userId })

    if (!doc) return null

    return {
      userId: doc.userId,
      tokenHash: doc.tokenHash,
      expiresAt: doc.expiresAt
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.model.deleteOne({ userId })
  }
}
