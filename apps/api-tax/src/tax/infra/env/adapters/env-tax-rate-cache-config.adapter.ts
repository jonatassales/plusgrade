import { Injectable } from '@nestjs/common'

import { TaxRateCacheConfigPort } from '@application/ports/tax-rate-cache-config.port'
import { EnvFlag } from '@infra/env/env.flag.enum'
import { EnvService } from '@infra/env/env.service'

@Injectable()
export class EnvTaxRateCacheConfigAdapter implements TaxRateCacheConfigPort {
  constructor(private readonly env: EnvService) {}

  getTtlSeconds(): number {
    return this.env.requireNumber(EnvFlag.TaxRateCacheTtlSeconds)
  }
}
