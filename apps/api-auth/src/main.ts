import { NestFactory } from '@nestjs/core'

import { AuthLogEvent } from '@infra/axiom/observability/auth-log-event.enum'
import { logAxiomEvent } from '@infra/axiom/observability/axiom-logger'
import { LogLevel } from '@infra/axiom/observability/log-level.enum'
import { requireNumberEnv } from '@common/env'

import { AppModule } from './app.module'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule)
    const port = requireNumberEnv('PORT')

    await app.listen(port)
  } catch (error) {
    await logAxiomEvent({
      event: AuthLogEvent.ServiceStartupFailed,
      level: LogLevel.Error,
      context: {
        errorMessage: error instanceof Error ? error.message : 'unknown'
      }
    })

    process.exit(1)
  }
}
bootstrap()
