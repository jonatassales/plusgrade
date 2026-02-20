import { Injectable, NotFoundException } from '@nestjs/common'

import { GetTaxRateByYearUseCase } from '@application/use-cases/get-tax-rate-by-year.usecase'
import type { BandTaxResult } from '@domain/types/band-tax-result.type'
import type { TaxCalculationSummary } from '@domain/types/tax-calculation-summary.type'
import type { WithYear } from '@domain/types/with-year.type'
import { TaxCalculatorService } from '@domain/services/tax-calculator.service'
import { Salary } from '@domain/value-objects/salary.value-object'
import { TaxYear } from '@domain/value-objects/tax-year.value-object'

export type CalculateTaxResult = WithYear & {
  salary: number
} & TaxCalculationSummary & {
    taxesByBand: BandTaxResult[]
  }

@Injectable()
export class CalculateTaxUseCase {
  constructor(
    private readonly getTaxRateByYearUseCase: GetTaxRateByYearUseCase,
    private readonly taxCalculatorService: TaxCalculatorService
  ) {}

  async execute(year: TaxYear, salary: Salary): Promise<CalculateTaxResult> {
    const taxRate = await this.getTaxRateByYearUseCase.execute(year)
    if (!taxRate) {
      throw new NotFoundException(
        `Tax rates not found for year ${year.toNumber()}`
      )
    }

    const calculation = this.taxCalculatorService.calculate(
      salary,
      taxRate.brackets
    )

    return {
      year: year.toNumber(),
      salary: salary.toNumber(),
      totalTax: calculation.totalTax,
      effectiveRate: calculation.effectiveRate,
      taxesByBand: calculation.bands
    }
  }
}
