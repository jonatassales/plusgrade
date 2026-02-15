import axios from 'axios'

type RequestIncomeTaxParams = {
  income: string
  year: string
  baseUrl: string
}

function getTimeoutMs(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export async function requestIncomeTax(params: RequestIncomeTaxParams) {
  const { income, year, baseUrl } = params
  const timeoutMs = getTimeoutMs(
    process.env.WEB_INTERNAL_API_TIMEOUT_MS,
    10_000
  )
  const response = await axios.get<{ result: number }>(
    `${baseUrl}/api/income-tax`,
    {
      params: { income, year },
      timeout: timeoutMs
    }
  )

  return response.data.result
}
