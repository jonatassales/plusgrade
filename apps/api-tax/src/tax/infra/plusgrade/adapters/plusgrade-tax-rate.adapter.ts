import { Injectable } from '@nestjs/common'

import { TaxRatePort } from '@domain/ports/tax-rate.port'
import { TaxBracket } from '@domain/value-objects/tax-bracket.value-object'
import { TaxRate } from '@domain/value-objects/tax-rate.value-object'
import { TaxYear } from '@domain/value-objects/tax-year.value-object'
import { ExternalTaxApiClient } from '@infra/plusgrade/http'

@Injectable()
export class PlusgradeTaxRateAdapter implements TaxRatePort {
  constructor(private readonly externalClient: ExternalTaxApiClient) {}

  async findByYear(year: TaxYear): Promise<TaxRate | null> {
    const yearValue = year.toNumber()
    const brackets = await this.externalClient.getTaxBrackets(yearValue)

    const taxBrackets = brackets.map((bracket) =>
      TaxBracket.create({
        min: bracket.min,
        max: bracket.max ?? null,
        rate: bracket.rate
      })
    )

    return TaxRate.create(year, taxBrackets)
  }
}
