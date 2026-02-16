'use client'

import { useActionState, useMemo, useRef, useState } from 'react'

import {
  Field,
  FieldLabel,
  FieldError
} from '@/infra/shadcn/components/ui/field'
import { Input } from '@/infra/shadcn/components/ui/input'
import { Button } from '@/infra/shadcn/components/ui/button'

import {
  type IncomeTaxFieldErrors,
  type IncomeTaxFormState
} from '@/app/_features/income-tax/domain/income-tax.types'
import { incomeTaxInputSchema } from '@/app/_features/income-tax/domain/income-tax.schema'
import { IncomeTaxResult } from '@/app/_features/income-tax/ui/IncomeTaxResult'
import { IncomeTaxResultErrorBoundary } from '@/app/_features/income-tax/ui/IncomeTaxResultErrorBoundary'

type IncomeTaxFormProps = {
  defaultIncome: string
  defaultYear: string
  calculateIncomeTax: (
    previousState: IncomeTaxFormState,
    formData: FormData
  ) => Promise<IncomeTaxFormState>
}

export function IncomeTaxForm(props: IncomeTaxFormProps) {
  const { defaultIncome, defaultYear, calculateIncomeTax } = props
  const [income, setIncome] = useState(defaultIncome)
  const [year, setYear] = useState(defaultYear)
  const formRef = useRef<HTMLFormElement>(null)
  const [clientErrors, setClientErrors] = useState<IncomeTaxFieldErrors>({})
  const initialState = {
    income: defaultIncome,
    year: defaultYear,
    result: null,
    formError: null,
    fieldErrors: {}
  } satisfies IncomeTaxFormState
  const [state, formAction, isPending] = useActionState(
    calculateIncomeTax,
    initialState
  )

  const mergedErrors = useMemo<IncomeTaxFieldErrors>(
    () => ({
      income: clientErrors.income ?? state.fieldErrors.income,
      year: clientErrors.year ?? state.fieldErrors.year
    }),
    [clientErrors, state.fieldErrors]
  )

  function sanitizeDigits(value: string) {
    return value.replace(/\D/g, '')
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const parsed = incomeTaxInputSchema.safeParse({ income, year })

    if (parsed.success) {
      setClientErrors({})
      return
    }

    event.preventDefault()
    const fieldErrors = parsed.error.flatten().fieldErrors
    setClientErrors({
      income: fieldErrors.income?.[0],
      year: fieldErrors.year?.[0]
    })
  }

  function handleBoundaryRetry() {
    formRef.current?.requestSubmit()
  }

  return (
    <form
      ref={formRef}
      className="space-y-4"
      action={formAction}
      onSubmit={handleSubmit}
    >
      <Field data-invalid={Boolean(mergedErrors.income)}>
        <FieldLabel htmlFor="income">Annual income</FieldLabel>
        <Input
          id="income"
          name="income"
          type="text"
          inputMode="numeric"
          maxLength={12}
          autoComplete="off"
          value={income}
          onChange={(event) => setIncome(sanitizeDigits(event.target.value))}
          aria-invalid={Boolean(mergedErrors.income)}
          required
        />
        <FieldError>{mergedErrors.income}</FieldError>
      </Field>

      <Field data-invalid={Boolean(mergedErrors.year)}>
        <FieldLabel htmlFor="year">Tax year</FieldLabel>
        <Input
          id="year"
          name="year"
          type="text"
          inputMode="numeric"
          maxLength={4}
          autoComplete="off"
          value={year}
          onChange={(event) => setYear(sanitizeDigits(event.target.value))}
          aria-invalid={Boolean(mergedErrors.year)}
          required
        />
        <FieldError>{mergedErrors.year}</FieldError>
      </Field>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Calculating...' : 'Calculate'}
      </Button>
      <IncomeTaxResultErrorBoundary onRetryAction={handleBoundaryRetry}>
        <IncomeTaxResult
          result={state.result}
          error={state.formError}
          isPending={isPending}
        />
      </IncomeTaxResultErrorBoundary>
    </form>
  )
}
