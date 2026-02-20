import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

import { CachePort } from '@domain/ports/cache.port'
import { EnvFlag } from '@infra/env/env.flag.enum'
import { EnvService } from '@infra/env/env.service'

@Injectable()
export class RedisCacheAdapter implements CachePort {
  private readonly redis: Redis

  constructor(env: EnvService) {
    this.redis = new Redis(env.requireString(EnvFlag.RedisUrl))
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }
}
