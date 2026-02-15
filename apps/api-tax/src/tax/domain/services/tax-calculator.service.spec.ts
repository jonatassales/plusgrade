import { Salary } from '@domain/value-objects/salary.value-object'
import { TaxBracket } from '@domain/value-objects/tax-bracket.value-object'

import { TaxCalculatorService } from './tax-calculator.service'

describe('TaxCalculatorService', () => {
  const service = new TaxCalculatorService()
  const brackets2022: TaxBracket[] = [
    TaxBracket.create({ min: 0, max: 50197, rate: 0.15 }),
    TaxBracket.create({ min: 50197, max: 100392, rate: 0.205 }),
    TaxBracket.create({ min: 100392, max: 155625, rate: 0.26 }),
    TaxBracket.create({ min: 155625, max: 221708, rate: 0.29 }),
    TaxBracket.create({ min: 221708, max: null, rate: 0.33 })
  ]

  it('returns zero tax for salary 0', () => {
    const result = service.calculate(Salary.create(0), brackets2022)

    expect(result.totalTax).toBe(0)
    expect(result.effectiveRate).toBe(0)
    expect(result.bands).toEqual([])
  })

  it('calculates total tax for salary 50000', () => {
    const result = service.calculate(Salary.create(50000), brackets2022)

    expect(result.totalTax).toBe(7500)
    expect(result.effectiveRate).toBe(0.15)
    expect(result.bands).toHaveLength(1)
  })

  it('calculates total tax for salary 100000', () => {
    const result = service.calculate(Salary.create(100000), brackets2022)

    expect(result.totalTax).toBe(17739.17)
    expect(result.effectiveRate).toBe(0.18)
    expect(result.bands).toHaveLength(2)
  })

  it('calculates total tax for salary 1234567', () => {
    const result = service.calculate(Salary.create(1234567), brackets2022)

    expect(result.totalTax).toBe(385587.65)
    expect(result.effectiveRate).toBe(0.31)
    expect(result.bands).toHaveLength(5)
  })
})
