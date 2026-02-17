'use server'

import { headers } from 'next/headers'
import axios from 'axios'

import { type IncomeTaxFormState } from '@/app/_features/income-tax/domain/income-tax.types'
import { incomeTaxInputSchema } from '@/app/_features/income-tax/domain/income-tax.schema'
import { requestIncomeTax } from '@/app/_features/income-tax/actions/requestIncomeTax'
import { createIncomeTaxUiError } from '@/app/_features/income-tax/errors/create-income-tax-ui-error'
import { TaxError } from '@/app/_features/income-tax/errors/tax-error.enum'
import { LogLevel } from '@/infra/axiom/observability/log-level.enum'
import { WebLogEvent } from '@/infra/axiom/observability/web-log-event.enum'
import {
  logAxiomEvent,
  resolveRequestId
} from '@/infra/axiom/observability/axiom-logger'

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
  const requestId = resolveRequestId(headerStore.get('x-request-id'))
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host')

  if (!host) {
    await logAxiomEvent({
      event: WebLogEvent.IncomeTaxActionHostResolutionFailed,
      level: LogLevel.Error,
      requestId,
      context: {
        hasForwardedHost: Boolean(headerStore.get('x-forwarded-host')),
        hasHostHeader: Boolean(headerStore.get('host'))
      }
    })

    return {
      income,
      year,
      result: null,
      formError: createIncomeTaxUiError(TaxError.HostResolutionFailed),
      fieldErrors: {}
    }
  }

  const hostUrl = getHostUrl(host, headerStore.get('x-forwarded-proto'))

  try {
    const result = await requestIncomeTax({
      income: parsedInput.data.income,
      year: parsedInput.data.year,
      baseUrl: hostUrl,
      requestId
    })

    return {
      income: parsedInput.data.income,
      year: parsedInput.data.year,
      result,
      formError: null,
      fieldErrors: {}
    }
  } catch (error) {
    const isAxios = axios.isAxiosError(error)

    await logAxiomEvent({
      event: WebLogEvent.IncomeTaxActionFailed,
      level: LogLevel.Error,
      requestId,
      context: {
        incomeLength: parsedInput.data.income.length,
        year: parsedInput.data.year,
        statusCode: isAxios ? error.response?.status : undefined,
        errorCode: isAxios ? error.code : undefined
      }
    })

    return {
      income: parsedInput.data.income,
      year: parsedInput.data.year,
      result: null,
      formError: createIncomeTaxUiError(TaxError.UpstreamRequestFailed),
      fieldErrors: {}
    }
  }
}
