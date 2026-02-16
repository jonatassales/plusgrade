import axios from 'axios'
import { NextResponse } from 'next/server'

import { incomeTaxInputSchema } from '@/app/_features/income-tax/domain/income-tax.schema'
import { LogLevel } from '@/infra/axiom/observability/log-level.enum'
import { WebLogEvent } from '@/infra/axiom/observability/web-log-event.enum'
import {
  logAxiomEvent,
  resolveRequestId
} from '@/infra/axiom/observability/axiom-logger'

function getTimeoutMs(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function toErrorResponse(
  body: { error: string },
  status: number,
  requestId: string
) {
  return NextResponse.json(body, {
    status,
    headers: {
      'x-request-id': requestId
    }
  })
}

export async function GET(request: Request) {
  const requestId = resolveRequestId(request.headers.get('x-request-id'))
  const url = new URL(request.url)
  const income = url.searchParams.get('income') ?? ''
  const year = url.searchParams.get('year') ?? ''

  const parsedInput = incomeTaxInputSchema.safeParse({ income, year })

  if (!parsedInput.success) {
    await logAxiomEvent({
      event: WebLogEvent.IncomeTaxRouteValidationFailed,
      level: LogLevel.Warn,
      requestId,
      context: {
        issueCount: parsedInput.error.issues.length
      }
    })

    return toErrorResponse(
      { error: parsedInput.error.issues[0]?.message ?? 'Invalid input.' },
      400,
      requestId
    )
  }

  try {
    const apiTaxBaseUrl =
      process.env.API_TAX_BASE_URL ?? 'http://localhost:7001'
    const apiTaxTimeoutMs = getTimeoutMs(process.env.API_TAX_TIMEOUT_MS, 10_000)
    const apiTaxUrl = `${apiTaxBaseUrl}/tax-calculator/tax-year/${parsedInput.data.year}/salary/${parsedInput.data.income}`
    const response = await axios.get<{ totalTax: number }>(apiTaxUrl, {
      timeout: apiTaxTimeoutMs,
      headers: {
        'x-request-id': requestId
      }
    })

    return NextResponse.json(
      { result: response.data.totalTax },
      { headers: { 'x-request-id': requestId } }
    )
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502
      const message =
        typeof error.response?.data === 'object'
          ? (error.response?.data as { message?: string })?.message
          : null

      await logAxiomEvent({
        event: WebLogEvent.IncomeTaxRouteUpstreamFailed,
        level: LogLevel.Error,
        requestId,
        context: {
          statusCode: status,
          errorCode: error.code
        }
      })

      return toErrorResponse(
        {
          error: message ?? 'Unable to retrieve tax calculation from api-tax.'
        },
        status,
        requestId
      )
    }

    await logAxiomEvent({
      event: WebLogEvent.IncomeTaxRouteUnexpectedFailed,
      level: LogLevel.Error,
      requestId,
      context: {
        errorName: error instanceof Error ? error.name : 'unknown'
      }
    })

    return toErrorResponse(
      { error: 'Unexpected error while calculating income tax.' },
      500,
      requestId
    )
  }
}
