import { LogLevel } from '@infra/axiom/log-level.enum'

import { logRetryAttempt } from '@infra/plusgrade/logging/log-retry-attempt'

describe('logRetryAttempt', () => {
  const logger = {
    log: jest.fn().mockResolvedValue(undefined)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls logger with warn level when not last attempt', () => {
    logRetryAttempt(
      {
        attempt: 1,
        error: new Error('timeout'),
        year: 2024,
        isLastAttempt: false,
        maxRetries: 3,
        retryBackoffMs: 1000
      },
      logger as never
    )

    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.Warn,
        context: expect.objectContaining({
          year: 2024,
          attempt: 1,
          maxRetries: 3,
          isLastAttempt: false,
          backoffMs: 1000
        })
      })
    )
  })

  it('calls logger with error level when last attempt', () => {
    logRetryAttempt(
      {
        attempt: 3,
        error: new Error('failed'),
        year: 2023,
        isLastAttempt: true,
        maxRetries: 3,
        retryBackoffMs: 500
      },
      logger as never
    )

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.Error,
        context: expect.objectContaining({
          isLastAttempt: true,
          backoffMs: 1500
        })
      })
    )
  })
})
