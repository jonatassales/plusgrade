import { BadRequestException, PipeTransform } from '@nestjs/common'

import { TaxYear } from '@domain/value-objects/tax-year.value-object'

export class YearParamPipe implements PipeTransform<string, TaxYear> {
  transform(value: string): TaxYear {
    try {
      return TaxYear.create(Number(value))
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message)
      }

      throw new BadRequestException('Invalid year')
    }
  }
}
