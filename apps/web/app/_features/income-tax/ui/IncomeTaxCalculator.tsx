import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/infra/shadcn/components/ui/card'
import { calculateIncomeTaxAction } from '@/app/_features/income-tax/actions/calculateIncomeTaxAction'

import { IncomeTaxForm } from '@/app/_features/income-tax/ui/IncomeTaxForm'

type IncomeTaxCalculatorProps = {
  income: string
  year: string
}

export function IncomeTaxCalculator(props: IncomeTaxCalculatorProps) {
  const { income, year } = props

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Income Tax Calculator</CardTitle>
        <CardDescription>Enter annual income and tax year.</CardDescription>
      </CardHeader>

      <CardContent>
        <IncomeTaxForm
          defaultIncome={income}
          defaultYear={year}
          calculateIncomeTax={calculateIncomeTaxAction}
        />
      </CardContent>
    </Card>
  )
}
