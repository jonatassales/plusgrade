import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { CalculateTaxUseCase } from '@application/use-cases/calculate-tax.usecase'
import { GetTaxRateByYearUseCase } from '@application/use-cases/get-tax-rate-by-year.usecase'
import { TaxRateCacheConfigPort } from '@application/ports/tax-rate-cache-config.port'
import { CachePort } from '@domain/ports/cache.port'
import { TaxRatePort } from '@domain/ports/tax-rate.port'
import { TaxCalculatorService } from '@domain/services/tax-calculator.service'
import { PlusgradeTaxRateAdapter } from '@infra/plusgrade/adapters/plusgrade-tax-rate.adapter'
import {
  ExternalTaxApiClient,
  type ExternalTaxBracket
} from '@infra/plusgrade/http'

import { TaxController } from './tax.controller'

describe('TaxController (integration)', () => {
  let app: INestApplication

  const brackets2022: ExternalTaxBracket[] = [
    { min: 0, max: 50197, rate: 0.15 },
    { min: 50197, max: 100392, rate: 0.205 },
    { min: 100392, max: 155625, rate: 0.26 },
    { min: 155625, max: 221708, rate: 0.29 },
    { min: 221708, rate: 0.33 }
  ]

  const cacheMap = new Map<string, unknown>()

  const cacheMock: CachePort = {
    async get<T>(key: string): Promise<T | null> {
      return (cacheMap.get(key) as T | undefined) ?? null
    },
    async set<T>(key: string, value: T, _ttlSeconds: number): Promise<void> {
      cacheMap.set(key, value)
    }
  }

  const externalClientMock: Pick<ExternalTaxApiClient, 'getTaxBrackets'> = {
    async getTaxBrackets() {
      return brackets2022
    }
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TaxController],
      providers: [
        GetTaxRateByYearUseCase,
        CalculateTaxUseCase,
        TaxCalculatorService,
        PlusgradeTaxRateAdapter,
        {
          provide: TaxRateCacheConfigPort,
          useValue: { getTtlSeconds: () => 3600 }
        },
        { provide: CachePort, useValue: cacheMock },
        { provide: TaxRatePort, useClass: PlusgradeTaxRateAdapter },
        { provide: ExternalTaxApiClient, useValue: externalClientMock }
      ]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    cacheMap.clear()
  })

  it.each([
    { salary: 0, totalTax: 0 },
    { salary: 50000, totalTax: 7500 },
    { salary: 100000, totalTax: 17739.17 },
    { salary: 1234567, totalTax: 385587.65 }
  ])('returns expected total tax for salary $salary', async ({
    salary,
    totalTax
  }) => {
    const response = await request(app.getHttpServer()).get(
      `/tax-calculator/tax-year/2022/salary/${salary}`
    )

    expect(response.status).toBe(200)
    expect(response.body.year).toBe(2022)
    expect(response.body.salary).toBe(salary)
    expect(response.body.totalTax).toBe(totalTax)
    expect(response.body).toHaveProperty('effectiveRate')
    expect(Array.isArray(response.body.taxesByBand)).toBe(true)
  })

  it('returns validation error for unsupported year', async () => {
    const response = await request(app.getHttpServer()).get(
      '/tax-calculator/tax-year/2023/salary/50000'
    )

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Year not supported')
  })
})
