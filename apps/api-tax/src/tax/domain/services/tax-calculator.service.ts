import { Injectable } from '@nestjs/common'

import type { BandTaxResult } from '@domain/types/band-tax-result.type'
import type { TaxCalculationSummary } from '@domain/types/tax-calculation-summary.type'
import { Salary } from '@domain/value-objects/salary.value-object'
import { TaxBracket } from '@domain/value-objects/tax-bracket.value-object'

@Injectable()
export class TaxCalculatorService {
  calculate(
    salary: Salary,
    brackets: TaxBracket[]
  ): TaxCalculationSummary & { bands: BandTaxResult[] } {
    const salaryValue = salary.toNumber()

    if (salaryValue <= 0) {
      return {
        totalTax: 0,
        effectiveRate: 0,
        bands: [] as BandTaxResult[]
      }
    }

    let totalTax = 0
    const bands: BandTaxResult[] = []

    for (const bracket of brackets) {
      if (salaryValue <= bracket.min) continue

      const upper = bracket.max ?? salaryValue
      const taxable = Math.min(salaryValue, upper) - bracket.min

      if (taxable <= 0) continue

      const tax = taxable * bracket.rate

      totalTax += tax

      bands.push({
        min: bracket.min,
        max: bracket.max,
        rate: bracket.rate,
        taxableIncome: taxable,
        tax: this.round(tax)
      })
    }

    return {
      totalTax: this.round(totalTax),
      effectiveRate: this.round(totalTax / salaryValue),
      bands
    }
  }

  private round(value: number) {
    return Math.round(value * 100) / 100
  }
}
