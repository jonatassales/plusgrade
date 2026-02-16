import { LogLevel } from '@infra/axiom/observability/log-level.enum'

type LogEvent = {
  event: string
  level: LogLevel
  requestId?: string
  context?: Record<string, unknown>
}

const DEFAULT_AXIOM_BASE_URL = 'https://api.axiom.co/v1/datasets'

function getAxiomBaseUrl(): string {
  const configured = process.env.AXIOM_BASE_URL ?? DEFAULT_AXIOM_BASE_URL
  return configured.replace(/\/+$/, '')
}

export async function logAxiomEvent(event: LogEvent): Promise<void> {
  const dataset = process.env.AXIOM_DATASET
  const apiToken = process.env.AXIOM_API_TOKEN
  const axiomBaseUrl = getAxiomBaseUrl()

  if (!dataset || !apiToken) {
    return
  }

  try {
    await fetch(`${axiomBaseUrl}/${dataset}/ingest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          timestamp: new Date().toISOString(),
          service: 'api-tax',
          ...event
        }
      ])
    })
  } catch {
    // Never break tax APIs when telemetry delivery fails.
  }
}
