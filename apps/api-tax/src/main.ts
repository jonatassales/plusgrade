import { NestFactory } from '@nestjs/core'

import { AxiomLogger } from '@infra/axiom/logger'
import { LogLevel } from '@infra/axiom/log-level.enum'
import { TaxLogEvent } from '@infra/axiom/tax-log-event.enum'
import { EnvService } from '@infra/env/env.service'
import { EnvFlag } from '@infra/env/env.flag.enum'
import { AppModule } from './app.module'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule)
    const env = app.get(EnvService)
    const port = env.requireNumber(EnvFlag.Port)
    await app.listen(port)
  } catch (error) {
    const env = new EnvService()
    const logger = new AxiomLogger(env)
    await logger.log({
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
