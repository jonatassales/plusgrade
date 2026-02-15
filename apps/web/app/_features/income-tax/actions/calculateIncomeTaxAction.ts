'use server'

import { headers } from 'next/headers'

import { type IncomeTaxFormState } from '@/app/_features/income-tax/domain/income-tax.types'
import { incomeTaxInputSchema } from '@/app/_features/income-tax/domain/income-tax.schema'
import { requestIncomeTax } from '@/app/_features/income-tax/actions/requestIncomeTax'

function getHostUrl(host: string, forwardedProto: string | null) {
  const protocol =
    forwardedProto === 'https' || forwardedProto === 'http'
      ? forwardedProto
      : 'http'
  return `${protocol}://${host}`
}

export async function calculateIncomeTaxAction(
  _previousState: IncomeTaxFormState,
  formData: FormData
): Promise<IncomeTaxFormState> {
  const income = String(formData.get('income') ?? '').trim()
  const year = String(formData.get('year') ?? '').trim()

  const parsedInput = incomeTaxInputSchema.safeParse({ income, year })

  if (!parsedInput.success) {
    const fieldErrors = parsedInput.error.flatten().fieldErrors
    return {
      income,
      year,
      result: null,
      formError: null,
      fieldErrors: {
        income: fieldErrors.income?.[0],
        year: fieldErrors.year?.[0]
      }
    }
  }

  const headerStore = await headers()
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host')

  if (!host) {
    return {
      income,
      year,
      result: null,
      formError: 'Could not resolve request host.',
      fieldErrors: {}
    }
  }

  const hostUrl = getHostUrl(host, headerStore.get('x-forwarded-proto'))

  try {
    const result = await requestIncomeTax({
      income: parsedInput.data.income,
      year: parsedInput.data.year,
      baseUrl: hostUrl
    })

    return {
      income: parsedInput.data.income,
      year: parsedInput.data.year,
      result,
      formError: null,
      fieldErrors: {}
    }
  } catch {
    // TODO: return a retry token/metadata so the UI error boundary retry can replay this action.
    return {
      income: parsedInput.data.income,
      year: parsedInput.data.year,
      result: null,
      formError: 'Could not calculate income tax right now.',
      fieldErrors: {}
    }
  }
}
