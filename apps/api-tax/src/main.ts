import { NestFactory } from '@nestjs/core'

import { logAxiomEvent } from '@infra/axiom/observability/axiom-logger'
import { LogLevel } from '@infra/axiom/observability/log-level.enum'
import { TaxLogEvent } from '@infra/axiom/observability/tax-log-event.enum'
import { AppModule } from './app.module'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule)
    const port = requireNumberEnv('PORT')
    await app.listen(port)
  } catch (error) {
    await logAxiomEvent({
      event: TaxLogEvent.ServiceStartupFailed,
      level: LogLevel.Error,
      context: {
        errorMessage: error instanceof Error ? error.message : 'unknown'
      }
    })
    process.exit(1)
  }
}
bootstrap()

function requireNumberEnv(name: string): number {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`)
  }

  return parsed
}
