import { Module } from '@nestjs/common'

import { CalculateTaxUseCase } from '@application/use-cases/calculate-tax.usecase'
import { GetTaxRateByYearUseCase } from '@application/use-cases/get-tax-rate-by-year.usecase'
import { TaxRateCacheConfigPort } from '@application/ports/tax-rate-cache-config.port'
import { CachePort } from '@domain/ports/cache.port'
import { TaxRatePort } from '@domain/ports/tax-rate.port'
import { TaxCalculatorService } from '@domain/services/tax-calculator.service'
import { AxiomLogger } from '@infra/axiom/logger'
import { EnvTaxRateCacheConfigAdapter } from '@infra/env/adapters/env-tax-rate-cache-config.adapter'
import { EnvService } from '@infra/env/env.service'
import { PlusgradeTaxRateAdapter } from '@infra/plusgrade/adapters/plusgrade-tax-rate.adapter'
import { ExternalTaxApiClient } from '@infra/plusgrade/http'
import { RedisCacheAdapter } from '@infra/redis/adapters/redis-cache.adapter'
import { TaxController } from '@interface/http/tax.controller'

@Module({
  controllers: [TaxController],
  providers: [
    GetTaxRateByYearUseCase,
    CalculateTaxUseCase,
    TaxCalculatorService,
    AxiomLogger,
    ExternalTaxApiClient,
    EnvService,
    { provide: TaxRateCacheConfigPort, useClass: EnvTaxRateCacheConfigAdapter },
    { provide: CachePort, useClass: RedisCacheAdapter },
    { provide: TaxRatePort, useClass: PlusgradeTaxRateAdapter }
  ]
})
export class TaxModule {}
