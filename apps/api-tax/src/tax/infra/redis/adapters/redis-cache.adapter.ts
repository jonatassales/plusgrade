import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

import { CachePort } from '@domain/ports/cache.port'

@Injectable()
export class RedisCacheAdapter extends CachePort {
  private readonly redis = new Redis(this.requireStringEnv('REDIS_URL'))

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  private requireStringEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
  }
}
