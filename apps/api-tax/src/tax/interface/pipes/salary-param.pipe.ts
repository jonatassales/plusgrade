import { BadRequestException, PipeTransform } from '@nestjs/common'

import { Salary } from '@domain/value-objects/salary.value-object'

export class SalaryParamPipe implements PipeTransform<string, Salary> {
  transform(value: string): Salary {
    try {
      return Salary.create(Number(value))
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message)
      }

      throw new BadRequestException('Invalid salary')
    }
  }
}
