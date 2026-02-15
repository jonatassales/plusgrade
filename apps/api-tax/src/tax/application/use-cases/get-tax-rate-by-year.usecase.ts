import { Inject, Injectable } from '@nestjs/common'

import { CachePort } from '@domain/ports/cache.port'
import { TaxRatePort } from '@domain/ports/tax-rate.port'
import {
  TaxRate,
  type TaxRateSnapshot
} from '@domain/value-objects/tax-rate.value-object'
import { TaxYear } from '@domain/value-objects/tax-year.value-object'

@Injectable()
export class GetTaxRateByYearUseCase {
  private readonly cacheTtlSeconds = this.requireNumberEnv(
    'TAX_RATE_CACHE_TTL_SECONDS'
  )

  constructor(
    @Inject(CachePort) private readonly cache: CachePort,
    @Inject(TaxRatePort) private readonly repo: TaxRatePort
  ) {}

  async execute(year: TaxYear): Promise<TaxRate | null> {
    const yearValue = year.toNumber()
    const key = `tax-rate:${yearValue}`

    const cached = await this.cache.get<TaxRateSnapshot>(key)
    if (cached) return TaxRate.fromSnapshot(cached)

    const tax = await this.repo.findByYear(year)
    if (!tax) return null

    await this.cache.set(key, tax.toSnapshot(), this.cacheTtlSeconds)

    return tax
  }

  private requireNumberEnv(name: string): number {
    const value = process.env[name]
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`)
    }

    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      throw new Error(`Environment variable ${name} must be a valid number`)
    }

    return parsed
  }
}
