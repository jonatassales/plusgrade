import { Injectable } from '@nestjs/common'

@Injectable()
export class EnvService {
  requireString(name: string): string {
    const value = process.env[name]
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
  }

  requireNumber(name: string): number {
    const value = this.requireString(name)
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      throw new Error(`Environment variable ${name} must be a valid number`)
    }
    return parsed
  }
}
