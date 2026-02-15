import { User } from '@domain/entities/user.entity'
import { UserDocument } from '@infra/mongoose/schemas/user.schema'

export const userMapper = {
  toDomain(doc: UserDocument): User {
    return new User({
      id: doc._id.toString(),
      email: doc.email,
      passwordHash: doc.passwordHash,
      createdAt: doc.createdAt,
      refreshTokenHash: doc.refreshTokenHash
    })
  },

  toPersistence(user: User) {
    return {
      email: user.email,
      passwordHash: user.passwordHash,
      refreshTokenHash: user.refreshTokenHash
    }
  }
}
