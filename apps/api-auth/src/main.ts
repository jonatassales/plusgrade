import { NestFactory } from '@nestjs/core'

import { requireNumberEnv } from '@common/env'

import { AppModule } from './app.module'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule)
    const port = requireNumberEnv('PORT')
    await app.listen(port)
  } catch {
    // TODO: Send startup configuration failures to the external observability tool.
    process.exit(1)
  }
}
bootstrap()
