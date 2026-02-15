import { ConflictException } from '@nestjs/common'

import { User } from '@domain/entities/user.entity'
import { UserPort } from '@domain/ports/user.port'
import { Email } from '@domain/value-objects/email.value-object'

import { SignupUseCase } from './signup.usecase'

class InMemoryUserPort extends UserPort {
  users: User[] = []

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.email === email.toString()) ?? null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null
  }

  async create(user: User): Promise<void> {
    this.users.push(user)
  }
}

describe('SignupUseCase', () => {
  it('creates a new user', async () => {
    const users = new InMemoryUserPort()
    const useCase = new SignupUseCase(users)

    const result = await useCase.execute({
      email: 'john@example.com',
      password: '12345678'
    })

    expect(result.userId).toBeDefined()
    expect(users.users).toHaveLength(1)
    expect(users.users[0].email).toBe('john@example.com')
    expect(users.users[0].passwordHash).not.toBe('12345678')
  })

  it('throws conflict for duplicate email', async () => {
    const users = new InMemoryUserPort()
    users.users.push(
      new User({
        id: 'u-1',
        email: 'john@example.com',
        passwordHash: 'hash',
        createdAt: new Date()
      })
    )
    const useCase = new SignupUseCase(users)

    await expect(
      useCase.execute({
        email: 'john@example.com',
        password: '12345678'
      })
    ).rejects.toBeInstanceOf(ConflictException)
  })
})
