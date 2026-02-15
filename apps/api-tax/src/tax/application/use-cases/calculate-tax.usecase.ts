import { Injectable, NotFoundException } from '@nestjs/common'

import { GetTaxRateByYearUseCase } from '@application/use-cases/get-tax-rate-by-year.usecase'
import { TaxCalculatorService } from '@domain/services/tax-calculator.service'
import { Salary } from '@domain/value-objects/salary.value-object'
import { TaxYear } from '@domain/value-objects/tax-year.value-object'

interface TaxByBand {
  min: number
  max: number | null
  rate: number
  taxableIncome: number
  tax: number
}

export type CalculateTaxResult = {
  year: number
  salary: number
  totalTax: number
  effectiveRate: number
  taxesByBand: TaxByBand[]
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
      taxesByBand: calculation.bands.map((band) => ({
        min: band.min,
        max: band.max ?? null,
        rate: band.rate,
        taxableIncome: band.taxableIncome,
        tax: band.tax
      }))
    }
  }
}
