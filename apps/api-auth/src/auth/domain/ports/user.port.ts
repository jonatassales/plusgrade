import { User } from '@domain/entities/user.entity'
import { Email } from '@domain/value-objects/email.value-object'

export abstract class UserPort {
  abstract findByEmail(email: Email): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract create(user: User): Promise<void>
}
