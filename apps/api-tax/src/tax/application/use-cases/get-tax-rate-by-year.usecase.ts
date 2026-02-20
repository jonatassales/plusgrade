import { Inject, Injectable } from '@nestjs/common'

import { TaxRateCacheConfigPort } from '@application/ports/tax-rate-cache-config.port'
import { CachePort } from '@domain/ports/cache.port'
import { TaxRatePort } from '@domain/ports/tax-rate.port'
import type { TaxRateSnapshot } from '@domain/types/tax-rate-snapshot.type'
import { TaxRate } from '@domain/value-objects/tax-rate.value-object'
import { TaxYear } from '@domain/value-objects/tax-year.value-object'

@Injectable()
export class GetTaxRateByYearUseCase {
  private readonly cacheTtlSeconds: number

  constructor(
    @Inject(TaxRateCacheConfigPort) config: TaxRateCacheConfigPort,
    @Inject(CachePort) private readonly cache: CachePort,
    @Inject(TaxRatePort) private readonly repo: TaxRatePort
  ) {
    this.cacheTtlSeconds = config.getTtlSeconds()
  }

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
}
