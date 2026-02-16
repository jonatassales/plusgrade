import 'server-only'

import { LogLevel } from '@/infra/axiom/observability/log-level.enum'

type LogEvent = {
  event: string
  level: LogLevel
  requestId?: string
  context?: Record<string, unknown>
}

const AXIOM_BASE_URL = 'https://api.axiom.co/v1/datasets'

export function resolveRequestId(providedId: string | null): string {
  if (providedId) {
    return providedId
  }

  return crypto.randomUUID()
}

export async function logAxiomEvent(event: LogEvent): Promise<void> {
  const dataset = process.env.AXIOM_DATASET
  const apiToken = process.env.AXIOM_API_TOKEN

  if (!dataset || !apiToken) {
    return
  }

  try {
    await fetch(`${AXIOM_BASE_URL}/${dataset}/ingest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          timestamp: new Date().toISOString(),
          service: 'web',
          ...event
        }
      ])
    })
  } catch {
    // Do not interrupt request lifecycle when telemetry fails.
  }
}
