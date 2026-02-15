import axios from 'axios'
import { NextResponse } from 'next/server'

import { incomeTaxInputSchema } from '@/app/_features/income-tax/domain/income-tax.schema'

function getTimeoutMs(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const income = url.searchParams.get('income') ?? ''
  const year = url.searchParams.get('year') ?? ''

  const parsedInput = incomeTaxInputSchema.safeParse({ income, year })

  if (!parsedInput.success) {
    return NextResponse.json(
      { error: parsedInput.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 }
    )
  }

  try {
    const apiTaxBaseUrl =
      process.env.API_TAX_BASE_URL ?? 'http://localhost:7001'
    const apiTaxTimeoutMs = getTimeoutMs(process.env.API_TAX_TIMEOUT_MS, 10_000)
    const apiTaxUrl = `${apiTaxBaseUrl}/tax-calculator/tax-year/${parsedInput.data.year}/salary/${parsedInput.data.income}`
    const response = await axios.get<{ totalTax: number }>(apiTaxUrl, {
      timeout: apiTaxTimeoutMs
    })

    return NextResponse.json({ result: response.data.totalTax })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502
      const message =
        typeof error.response?.data === 'object'
          ? (error.response?.data as { message?: string })?.message
          : null

      return NextResponse.json(
        {
          error: message ?? 'Unable to retrieve tax calculation from api-tax.'
        },
        { status }
      )
    }

    return NextResponse.json(
      { error: 'Unexpected error while calculating income tax.' },
      { status: 500 }
    )
  }
}
