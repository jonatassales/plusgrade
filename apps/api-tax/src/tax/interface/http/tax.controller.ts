import { Controller, Get, Param } from '@nestjs/common'

import { CalculateTaxUseCase } from '@application/use-cases/calculate-tax.usecase'
import { GetTaxRateByYearUseCase } from '@application/use-cases/get-tax-rate-by-year.usecase'
import { Salary } from '@domain/value-objects/salary.value-object'
import { TaxYear } from '@domain/value-objects/tax-year.value-object'
import { type CalculateTaxResponseDto } from '@interface/dto/calculate-tax-response.dto'
import { SalaryParamPipe } from '@interface/pipes/salary-param.pipe'
import { YearParamPipe } from '@interface/pipes/year-param.pipe'

@Controller('tax-calculator')
export class TaxController {
  constructor(
    private readonly getTaxRateByYearUseCase: GetTaxRateByYearUseCase,
    private readonly calculateTaxUseCase: CalculateTaxUseCase
  ) {}

  @Get('tax-year/:year')
  async getByYear(@Param('year', YearParamPipe) year: TaxYear) {
    const taxRate = await this.getTaxRateByYearUseCase.execute(year)
    return taxRate?.toSnapshot() ?? null
  }

  @Get('tax-year/:year/salary/:salary')
  async calculate(
    @Param('year', YearParamPipe) year: TaxYear,
    @Param('salary', SalaryParamPipe) salary: Salary
  ): Promise<CalculateTaxResponseDto> {
    return this.calculateTaxUseCase.execute(year, salary)
  }
}
