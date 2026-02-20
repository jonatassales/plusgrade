import { Injectable } from '@nestjs/common'
import axios from 'axios'

import { EnvFlag } from '@infra/env/env.flag.enum'
import { EnvService } from '@infra/env/env.service'

import { LogLevel } from './log-level.enum'

export type AxiomLogEvent = {
  event: string
  level: LogLevel
  requestId?: string
  context?: Record<string, unknown>
}

@Injectable()
export class AxiomLogger {
  private readonly baseUrl: string
  private readonly dataset: string
  private readonly apiToken: string
  private readonly serviceName: string

  constructor(env: EnvService) {
    this.baseUrl = env.requireString(EnvFlag.AxiomBaseUrl).replace(/\/+$/, '')
    this.dataset = env.requireString(EnvFlag.AxiomDataset)
    this.apiToken = env.requireString(EnvFlag.AxiomApiToken)
    this.serviceName = env.requireString(EnvFlag.AxiomServiceName)
  }

  async log(event: AxiomLogEvent): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${this.dataset}/ingest`,
        [
          {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            ...event
          }
        ],
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (err) {
      console.error('[AxiomLogger] telemetry delivery failed', err)
    }
  }
}
